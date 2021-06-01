import { _decorator, Component, Node, Vec3, ColliderComponent, ITriggerEvent,AudioSource, Camera, math, Prefab, instantiate, AudioClip, AudioSourceComponent, Label, v3, ParticleSystemComponent, AnimationComponent, MeshCollider, MeshRenderer, Material, animation } from 'cc';
import { LeftRight } from './LeftRight';
const { ccclass, property } = _decorator;
let _tempPos = new Vec3();
const BALL_JUMP_STEP =[0.10, 0.08, 0.07, 0.05, 0.04, 0.03,0.02,0.01,0.01,0.005];       //Arrays values for ball jumping movements
const BALL_JUMP_FRAMES = 20;                                                           //Frames of ball jumps
@ccclass('BallMov')
export class BallMov extends Component {

   @property({type : Node})
   public Cam : Node = null;
   @property({type: LeftRight})
   LeftRight: LeftRight = null;
   @property({type:Prefab})
   ballTrailParticle: Prefab = null;
   @property(Label)
   score : Label = null;
   @property(Node)
   bonusScoreNode:Node = null;
   @property(Material)
   redMaterial:Material = null;
   @property(Material)
   greenMaterial:Material = null;
   @property(Node)
   wave:Node = null;

    ColsionHappen: boolean = null;
    NoContact =0;
    currJumpFrame =0;
    y =-30.04;                                                                  //a fixed value for camera movement
    scorecount =0;
    calldown1 = false;
    tempBallPosition =0;
    ScoreCount =0;
    wave1:Node;
    platFormMoveAnim = false;
    balldownspeed =0.1;
    start () {
        var _BallTrailParticle = instantiate(this.ballTrailParticle);           //ball trail particle instantiated
        _BallTrailParticle.parent = this.node;
        this.LeftRight.gameEnd(false);
        let Collider = this.node.getComponent(ColliderComponent);
        Collider.on('onTriggerEnter', this.onTrigger, this);
        this.getComponent(AudioSource).play();
        this.score.string = ''+this.scorecount;
        this.bonusScoreNode.active = false;
    }
  

    private onTrigger (event) {                                                                      //ball collider event
        this.bonusScoreNode.active = false;
        if(event.otherCollider.node.name == 'Tube0011'){

           for(var i=0; i<12; i++)
           {    this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].getComponent(AnimationComponent).play();
                //console.info(this.LeftRight.EmptyNodeForDestroyPlatfrom.children.length);
            }
            this.scheduleOnce(this.DestroyplatformNodes,0.2)
           this.ScoreCount += 1;
           if(this.ScoreCount>=2){
               this.bonusScoreNode.active = true;
               var scor = 5;
           }
           else
           {
               scor = 1;
           }
           if(this.ScoreCount>2)
           {
            this.balldownspeed =0.16;
            this.wave.active = true;
            this.node.getComponentInChildren(AnimationComponent).play();
           }
           this.scorecount += scor;
           this.score.string = ''+this.scorecount;
           
        }
        if(event.otherCollider.node.name == 'NormalNode')                                           //jumping logic active here
        {   if(this.ScoreCount >2)
            {  for(var i=0; i<12;i++)
                {
                    if(this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].name != 'Tube0011')
                    {
                        this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].getComponent(MeshRenderer).material = this.greenMaterial;
                    }
                }
                this.platFormMoveAnim = true;
                this.scheduleOnce(this.DestroyplatformNodes,0.3);
            }
            this.tempBallPosition = this.node.position.y;
            //console.info(this.node.position.y+ '  ball ke colliding ki pos');
            this.ColsionHappen = true;
            this.balldownspeed =0.1;
            this.calldown1 = false;
            this.ScoreCount = 0;
            
        }

        if(event.otherCollider.node.name == 'DeathNode')                                            //Game End Logic when Ball collide with Deathnode
        {  if(this.ScoreCount >2)
            {  for(var i=0; i<12;i++)
                {
                    if(this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].name != 'Tube0011')
                    {
                        this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].getComponent(MeshRenderer).material = this.greenMaterial;
                    }
                }
                this.platFormMoveAnim = true;
                this.scheduleOnce(this.DestroyplatformNodes,0.3);
                this.tempBallPosition = this.node.position.y;
                this.ColsionHappen = true;
                this.balldownspeed =0.1;
                this.calldown1 = false;
                this.ScoreCount = 0;
            }
            else
            {
            this.currJumpFrame = 21; this.ColsionHappen = true; this.NoContact=0;
            this.LeftRight.gameEnd(true);
            this.scorecount =0;
            this.score.string = ''+this.scorecount;
            }
        }
        this.getComponent(AudioSource).play();
        
    }

    DestroyplatformNodes(){
        this.platFormMoveAnim =false;
        for(var i=0; i<12; i++)
        {
            this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].destroy();
        }
    }

    update (deltaTime: number) {
        this.BallUP();                                                                                 //MovPosY call everty time for smooth ball movement

        if(this.tempBallPosition >= this.node.position.y-0.000000000001 && (!this.ColsionHappen) )                      //Camera Movement logic and Ball Down States
        {    _tempPos.y = _tempPos.y-this.balldownspeed;
            this.node.setPosition(_tempPos);
            this.NoContact=1;

            var tempcampos = this.Cam.getWorldPosition().y;
            tempcampos -= this.balldownspeed;
            this.Cam.setWorldPosition(this.Cam.getWorldPosition().x, tempcampos, this.Cam.getWorldPosition().z);
            if(tempcampos<this.y)
            {   this.y -=20;
                this.LeftRight.CreateAndDeleteCylinder();
            }

        }
        if(this.calldown1){
            this.Balldown();
        }

        if(this.platFormMoveAnim)
        { 
            for(var i=0; i<12; i++)
            {
                this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].setPosition(this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].position.x,this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].position.y-0.1,this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].position.z);
                this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].eulerAngles = v3(this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].eulerAngles.x+1,this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].eulerAngles.y,this.LeftRight.EmptyNodeForDestroyPlatfrom.children[i].eulerAngles.z);
            }
            this.wave.active = false;
        }
        
    }

    BallUP()
    {
        _tempPos.set(this.node.position)
        if(this.ColsionHappen == true && this.currJumpFrame<20)                                            //BallJump Logic using arrays and frame values
        {  
            if(this.currJumpFrame<20)
            {   
                _tempPos.y += BALL_JUMP_STEP[Math.floor(this.currJumpFrame / 2)]
                this.node.setPosition(_tempPos)
                this.currJumpFrame++;
                if(this.currJumpFrame ==20)
                {   _tempPos.set(this.node.position)
                    this.currJumpFrame = 0;
                    this.ColsionHappen = false;
                    this.calldown1 = true;
                }
            
            }

        }
    }
    Balldown(){                                                                                         //BallDown Logic using arrays and frame values
        _tempPos.set(this.node.position)
        _tempPos.y -= BALL_JUMP_STEP[Math.floor((BALL_JUMP_FRAMES - this.currJumpFrame-1) / 2)];
            this.node.setPosition(_tempPos)
            this.currJumpFrame++;
           if(this.currJumpFrame==20)
           {
               this.currJumpFrame=0;
               this.calldown1= false;
               this.ColsionHappen = null;
           }
    }
   
}
