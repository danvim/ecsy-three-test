import { GameWorld } from '../GameWorld'
import { Group, Object3D } from 'three'
import TreeComponent from '../components/TreeComponent'
import { getObject } from '../../3d/assets'
import { MODELS, TREE_MODELS, TreeType } from '../../3d/constants'

export const createTree = async (gameWorld: GameWorld, treeType: TreeType): Promise<void> => {
  const tree = new Group()
  const topObj = new Object3D()
  topObj.add(await getObject(TREE_MODELS[treeType]))
  const shade = new Object3D()
  shade.add(await getObject(MODELS.SHADE))
  const trunkObj = new Object3D()
  trunkObj.add((await getObject(MODELS.TRUNK)))
  tree.add(topObj, trunkObj, shade)
  const e = gameWorld.world
    .createEntity()
    .addObject3DComponent(tree, gameWorld.scene)
    .addComponent(TreeComponent, {
      treeType,
      growthStage: 0,
      topObj,
      trunkObj,
      shade
    })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  window.entity = e
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  window.tree = e.getMutableComponent(TreeComponent)
}
