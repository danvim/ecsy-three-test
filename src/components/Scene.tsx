import React, { FunctionComponent, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import {
  AmbientLight,
  DirectionalLight,
  Group,
  Mesh, MeshPhongMaterial,
  Object3D,
  PlaneGeometry, ShadowMaterial,
  VSMShadowMap,
  WebGLRenderer
} from 'three'
import { ECSYThreeWorld, initialize } from 'ecsy-three'
import { getObject, startLoad } from '../3d/assets'
import { MODELS, SUN_ANGLE } from '../3d/constants'
import TreeComponent from '../game/components/TreeComponent'
import TreeSystem from '../game/systems/TreeSystem'
import HexCoordsComponent from '../game/components/HexCoordsComponent'
import { GameWorld } from '../game/GameWorld'
import { createTree } from '../game/entities/tree'

const sceneProps = {}

const Scene: FunctionComponent<PropTypes.InferProps<typeof sceneProps>> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    startLoad()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas !== null) {
      (async () => {
        // Setup scene
        const renderer = new WebGLRenderer({
          canvas//,
          // antialias: true
        })
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = VSMShadowMap

        const world = new ECSYThreeWorld()

        const { sceneEntity, camera } = initialize(world, {
          renderer
        })

        const gameWorld = new GameWorld(world, sceneEntity)

        camera.position.set(25, 20, 25)
        camera.rotation.y = 0.67

        const treeTop = await getObject(MODELS.BLUE_TOP)

        const ambientLight = new AmbientLight(0x191F48, 0.5)

        const sun = new DirectionalLight(0xF8FFB2, 1)
        sun.position.set(0, Math.sin(SUN_ANGLE) * 100, 100)
        sun.castShadow = true
        sun.shadow.camera.visible = true
        sun.shadow.bias = -0.0005
        sun.shadow.radius = 32
        sun.shadow.camera.near = 10
        sun.shadow.camera.far = 150
        sun.shadow.camera.top = -10
        sun.shadow.camera.bottom = 20
        sun.shadow.mapSize.set(2 ** 11, 2 ** 11)
        const sunContainer = new Group()
        sunContainer.name = 'sun'
        sunContainer.add(sun)

        const sky = new DirectionalLight(0xFFFFFF, 0.2)
        sky.name = 'sky'
        sky.castShadow = true
        sky.shadow.bias = -0.0005
        sky.shadow.radius = 128
        sky.shadow.camera.near = 10
        sky.shadow.camera.far = 150
        sky.shadow.mapSize.set(2 ** 12, 2 ** 12)
        sky.position.y = 100

        const commonLights = new Group()
        commonLights.name = 'commonLights'
        commonLights.add(ambientLight, sky)

        const floorGeometry = new PlaneGeometry(500, 500)
        const floorMesh = new Mesh(
          floorGeometry,
          new MeshPhongMaterial({
            color: 0x9AC640,
            specular: 0.5
          })
        )
        floorMesh.receiveShadow = false
        const floorMeshShadow = new Mesh(
          floorGeometry,
          new ShadowMaterial({
            color: 0x194B21
          })
        )
        floorMeshShadow.receiveShadow = true
        const floorObj = new Object3D()
        floorObj.name = 'floor'
        floorObj.add(floorMesh, floorMeshShadow)
        floorObj.rotateX(-Math.PI / 2)

        world.registerComponent(TreeComponent)
        world.registerComponent(HexCoordsComponent)

        world.registerSystem(TreeSystem)

        createTree(gameWorld, 'GREEN').catch(console.error)

        world
          .createEntity()
          .addObject3DComponent(floorObj, sceneEntity)

        world
          .createEntity()
          .addObject3DComponent(commonLights, sceneEntity)

        world
          .createEntity()
          .addObject3DComponent(sunContainer, sceneEntity)

        // eslint-disable-next-line
        // @ts-ignore
        window.world = world

        let lastTime = performance.now()

        const run = (): void => {
          const time = performance.now()
          const delta = time - lastTime

          world.execute(delta, time)

          lastTime = time
          requestAnimationFrame(run)
        }

        run()
      })().catch(console.error)
    }
  }, [canvasRef])

  return (
    <div style={{
      width: '100vw',
      height: '100vh'
    }}>
      <canvas ref={canvasRef}/>
    </div>
  )
}

Scene.propTypes = sceneProps

export default Scene
