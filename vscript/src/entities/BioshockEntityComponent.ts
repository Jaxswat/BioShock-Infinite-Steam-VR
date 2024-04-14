export abstract class BioshockEntityComponent {
    protected enabled: boolean;

    protected constructor() {
        this.enabled = true;
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

    public isEnabled(): boolean {
        return this.enabled;
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }
}

export class BioshockEntityComponentManager {
    private components: BioshockEntityComponent[];

    public constructor() {
        this.components = [];
    }

    public add(component: BioshockEntityComponent): void {
        this.components.push(component);
    }

    public update(delta: number): void {
        for (const component of this.components) {
            if (component.isEnabled()) {
                component.update(delta);
            }
        }
    }

    public updatePose(delta: number): void {
        for (const component of this.components) {
            if (component.isEnabled()) {
                component.updatePose(delta);
            }
        }
    }
}
