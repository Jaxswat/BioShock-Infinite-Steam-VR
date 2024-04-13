import Elizabeth from "../Elizabeth";

export default abstract class LizComponent {
    protected liz: Elizabeth;

    constructor(liz: Elizabeth) {
        this.liz = liz;
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
