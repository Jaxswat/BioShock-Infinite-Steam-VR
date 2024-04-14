import {BioshockEntityComponentManager} from "./BioshockEntityComponent";

export default abstract class BioshockEntity {
    protected entity: CBaseEntity;
    protected components: BioshockEntityComponentManager;

    protected constructor(entity: CBaseEntity) {
        this.entity = entity;
        this.components = new BioshockEntityComponentManager();
    }

    /**
     * Returns the underlying entity reference
     */
    public getEntity(): CBaseEntity {
        return this.entity;
    }

    /**
     * Called every tick
     */
    public update(delta: number): void {
        this.components.update(delta);
    }

    /**
     * Called every frame to update the animations/poses smoothly
     */
    public updatePose(delta: number): void {
        this.components.updatePose(delta);
    }
}
