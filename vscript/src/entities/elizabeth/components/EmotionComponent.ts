import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";

export default class EmotionComponent extends LizComponent {
    private addSmile: boolean;
    private smile: number;

    public constructor(liz: Elizabeth) {
        super(liz);

        this.addSmile = true;
        this.smile = 0;
    }

    public updatePose(delta: number): void {
        if (this.smile >= 1) {
            this.addSmile = false;
        } else if (this.smile <= 0){
            this.addSmile = true;
        }

        if (this.addSmile) {
            this.smile += 0.002
        } else {
            this.smile -= 0.002
        }

        this.liz.getEntity().SetPoseParameter("face_smile", this.smile);
    }

    /**
     * Sets smile percentage 0 - 1
     */
    public setSmile(smile: number): void {
        this.smile = smile;
    }
}
