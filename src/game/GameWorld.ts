import { ECSYThreeWorld } from 'ecsy-three'
import { Entity } from 'ecsy'

export class GameWorld {
  public world: ECSYThreeWorld
  public scene: Entity

  constructor (world: ECSYThreeWorld, scene: Entity) {
    this.world = world
    this.scene = scene
  }
}
