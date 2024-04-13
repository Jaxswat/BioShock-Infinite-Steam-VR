export default abstract class BioshockEntity {
    protected entity: CBaseEntity;

    protected constructor(entity: CBaseEntity) {
        this.entity = entity;
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

    }

    /**
     * Called every frame to update the animations/poses smoothly
     */
    public updatePose(delta: number): void {

    }
}
