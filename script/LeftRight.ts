import { _decorator, Component, Node, systemEvent, SystemEventType, SystemEvent,AudioSource, macro, v3, Prefab, instantiate, math, ColliderComponent, ITriggerEvent, director, Vec3 } from 'cc';
import { BallMov } from './BallMov';
const { ccclass, property } = _decorator;

enum GameState{                                             //Game States
    GS_INIT,
    GS_PLAYING,
    GS_END,
};

@ccclass('LeftRight')
export class LeftRight extends Component {
    @property({type: Prefab})
    NormalNode: Prefab = null;
    @property({type: Prefab})
    DeathNode: Prefab = null;
    @property({type: Prefab})
    newcylinder: Prefab = null;
    @property({type:Prefab})
    emptySpaceNode : Prefab = null;
    @property({type: Node})
    public StartMenu : Node = null;
    @property({type: Node})
    public EndMenu : Node = null;

    @property({type:Node})
    LevelChoose : Node = null;
    @property({type:Node})
    EmptyNodeForDestroyPlatfrom: Node = null;


    
    private _CurStat : GameState = GameState.GS_INIT;      //define current game State

    public HelixRotationState: boolean = false;
            touchPos =0;
            movePos =0;
            _ismoving: boolean = false;
            _valueOld=0;
            platformNo = 6.8;
            newHelixlength =0;
            helixprefbnode : Node[]=new Array(3);
            arraypos = -1;
            tempnodepos=0;
            hardlevel: boolean = false;
            helix: Node;
    start () {
        this.node.eulerAngles = v3(0,0,0);
        this.CurStat = GameState.GS_INIT;
        this.EndMenu.active = false;
        this.LevelChoose.active = null;
        this.hardlevel = false;
        systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this);
        systemEvent.on(SystemEvent.EventType.TOUCH_START, this.onTouchStart, this);
        systemEvent.on(SystemEvent.EventType.TOUCH_END, this.onTouchEnd, this)
        this.arraypos++;
        this.platformNo = 7;                                                      //First Node Generated for displaying with only one platform
        this.helixprefbnode[this.arraypos] = instantiate(this.newcylinder);         //Stored Node one in array
        this.helixprefbnode[this.arraypos].parent = this.node;
        var rotationval =0;
        for(var i=0 ; i<12; i++)                                                   //Platform one Generated
        {  
            if(i!=1 && i!=2){
            this.helix = instantiate(this.NormalNode);
            this.helix.setPosition(0,this.platformNo,0);
                this.helix.eulerAngles = v3(-90,rotationval,0)
                this.EmptyNodeForDestroyPlatfrom.addChild(this.helix);
                rotationval +=30;
            }
            else{                                                                 //Empty Node is generated for Score Count
                this.helix = instantiate(this.emptySpaceNode);
                this.helix.setPosition(0,this.platformNo-0.08,0);
                this.helix.eulerAngles = v3(-90,rotationval,0);
                this.EmptyNodeForDestroyPlatfrom.addChild(this.helix);
                rotationval +=30;
            }
        }
        console.info(this.EmptyNodeForDestroyPlatfrom.children.length);
    }

    init(){
        this.StartMenu.active = true;
        this.EndMenu.active = false;
    }
    set CurStat(value : GameState)                                              //Game States Defined
    {
        switch(value){
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                this.StartMenu.active = false; 
                break;
            case GameState.GS_END:
                this.EndMenu.active = true;
        }
        this._CurStat = value;
    }
    gameEnd(val:boolean)                                                    //Game Terminated
    {
        if(val)
        { 
            this.CurStat= GameState.GS_END;
        }
        
    }
    onEasyButtonClicked(){                                                 //Chooseing easy Levels
        this.platformNo -=2.5;
        this.newHelixlength = -20;
        this.NewCylinder();
        this.LevelChoose.active = false;
    }
    onHardButtonClicked(){                                               //Chooseing Hard Levels
        this.hardlevel = true;
        this.platformNo -=2.5;
        this.newHelixlength = -20;
        this.NewCylinder();
        this.LevelChoose.active = false;
    }
    onStartButtonClicked() {                                            //start game with play button
        this.LevelChoose.active = true;
        this.CurStat= GameState.GS_PLAYING;
        this.EndMenu.active = false;
    }
    onRestartclicked(){
        this.EmptyNodeForDestroyPlatfrom.destroyAllChildren();
        this.node.destroyAllChildren();
        director.loadScene('scene');
    }
    NewCylinder(){                                                      //2 more CylinderNode and Platform are Generated only for first time of game Load at array pos 1 and 2;
            for(var l =0;l<2;l++)
            {
                this.arraypos++;
                this.helixprefbnode[this.arraypos] = instantiate(this.newcylinder);
                this.helixprefbnode[this.arraypos].parent = this.node;
                this.helixprefbnode[this.arraypos].setPosition(0,this.newHelixlength,0);
                this.newHelixlength -=20;
            }
        }                                                           //Endless game Logic
    CreateAndDeleteCylinder(){                                      //CylinderNode destory and Created again and again  after a specific gap in camera location
        this.helixprefbnode[this.tempnodepos].destroy();
        this.helixprefbnode[this.tempnodepos] = instantiate(this.newcylinder);
        this.helixprefbnode[this.tempnodepos].parent = this.node;
        this.helixprefbnode[this.tempnodepos].setPosition(0,this.newHelixlength,0);
        this.newHelixlength -=20;
        this.tempnodepos++;
        if(this.tempnodepos == 3)
        {
            this.tempnodepos =0;
        }
    }
    onTouchMove(touch , event){                                      //TouchEvents
        this.movePos = touch.getLocation().x;
        //console.info(this.movePos+' touchmove pos');
        this.HelixRotationState = true;
       
        this._valueOld = this.movePos;
    }
   onTouchStart(touch , event){
    this.touchPos = touch.getLocation().x;
    //console.info(this.touchPos+' touchpad pos');
        this.HelixRotationState = false;
   }
   onTouchEnd(touch , event){
    this.HelixRotationState = false;
   }

    update (deltaTime: number) {
        if(this.EmptyNodeForDestroyPlatfrom.children.length<192 && (this.LevelChoose.active ==false)&&(this.StartMenu.active == false)){
            this.createplatform();
        }
        if(this.HelixRotationState && (this.StartMenu.active == false) && (this.LevelChoose.active == false) &&(this.EndMenu.active == false)){
            var dt = deltaTime;
            this.moveRightLeft(dt);                                           //Node Rotaion method called
        }
    }

    createplatform(){                                                      //Helix Platform generation
        var DeatAndEmptyhNodeCount =5;
        if(this.hardlevel)
        {
            DeatAndEmptyhNodeCount = 6;
        }
        var rotationval =0;
        var uniq = new Set()
        do{
            uniq.add(math.randomRangeInt(0,11));
        }
        while(uniq.size<DeatAndEmptyhNodeCount);
        var Itreatro = uniq.values();
        var arr = new Array(uniq.size)
        for(var i=0; i<uniq.size;i++)
        {
            arr[i] =Itreatro.next().value;
        }
        for(var i=0; i<12; i++)
        { 
            if(i== arr[0] || i== arr[2] || i== arr[4])                              //for EmptyNode Generation
            {
                this.helix = instantiate(this.emptySpaceNode);
                this.helix.setPosition(0,this.platformNo-0.08,0);
                this.helix.eulerAngles = v3(-90,rotationval,0)
                this.EmptyNodeForDestroyPlatfrom.addChild(this.helix);
                rotationval = rotationval+30;
            }
            else if(i== arr[1] || i== arr[3] || i== arr[5])                                      //For DeathNode Generation
            {
                this.helix = instantiate(this.DeathNode);
                this.helix.setPosition(0,this.platformNo,0);
                this.helix.eulerAngles = v3(-90,rotationval,0)
                this.EmptyNodeForDestroyPlatfrom.addChild(this.helix);
                rotationval = rotationval+30;
            }
            else                                                                   //For NormalNode Generation
            {   
                this.helix = instantiate(this.NormalNode);
                this.helix.setPosition(0,this.platformNo,0);
                this.helix.eulerAngles = v3(-90,rotationval,0)
                this.EmptyNodeForDestroyPlatfrom.addChild(this.helix);
                rotationval = rotationval+30;
               
            }
            
        }
        console.info(this.EmptyNodeForDestroyPlatfrom.children.length);
        this.platformNo = this.platformNo-2.5;                                    //Decreasing the platform Position
    }
    
    moveRightLeft(dt:number){                                                               //Rotation of CylinderNode
        if(this.movePos > this.touchPos)
        {   var t = this.movePos/this.touchPos;
            t =t*2;
           // console.info(t);
            this.node.eulerAngles = v3(0, this.node.eulerAngles.y+3,0);
            this.touchPos = this.movePos;
        }
        if(this.movePos < this.touchPos){
            var t = this.movePos/this.touchPos;
            t = t*2;
            //console.info(t);
           this.node.eulerAngles = v3(0, this.node.eulerAngles.y-3,0);
           this.touchPos = this.movePos;
        }
    }
}
