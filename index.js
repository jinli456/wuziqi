$(function(){
    var canvas=$("#canvas").get(0);
    var ctx=canvas.getContext('2d');
    var ROW=15;//常量 15格
    var width=canvas.width;
    var off=width/ROW;
    var blocks={};
    var audio=$('audio').get(0);
    //绘制棋盘
    function draw() {
    ctx.beginPath();
        for(var i=0;i<ROW;i++){
            ctx.moveTo(off/2+0.5,off/2+0.5+i*off);
            ctx.lineTo((ROW-0.5)*off+0.5,off/2+0.5+i*off);
        }
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        for(var i=0;i<ROW;i++){
            ctx.moveTo(off/2+0.5+i*off,off/2+0.5);
            ctx.lineTo(off/2+0.5+i*off,(ROW-0.5)*off+0.5);
        }
        ctx.stroke();
        ctx.closePath();
    }

    draw();
    //绘制星标
    function drawCicle(x,y) {
        ctx.beginPath();
        ctx.arc(x*off,y*off,2,0,2*Math.PI);
        ctx.fill();
        ctx.closePath();
    }
     drawCicle(3.5,3.5);
     drawCicle(3.5,11.5);
     drawCicle(7.5,7.5);
     drawCicle(11.5,3.5);
     drawCicle(11.5,11.5);
    function drawChess(position,color) {
        audio.play();
        ctx.save();
        ctx.beginPath();
        if(color=='black'){
            /*var img = new Image();
            img.src = 'hei.png';
            ctx.drawImage(img, -15, -15, 30, 30);*/

            var radgrad = ctx.createRadialGradient(-3,-3,2,0,0,15);
            radgrad.addColorStop(0, 'white');
            radgrad.addColorStop(0.5, 'black');

            ctx.fillStyle=radgrad;

           /* ctx.fillStyle="#000";*/
        }else if(color=='white'){
            /*var img = new Image();
            img.src = 'bai.png';
            ctx.drawImage(img, -15, -15, 30, 30);
*/
             ctx.shadowColor="black";
             ctx.shadowBlur=5;
             ctx.offsetX=1;
             ctx.offsetY=1;
             ctx.fillStyle='white'

            /*ctx.fillStyle="#ccc";*/
        }
        ctx.translate((position.x+0.5)*off,(position.y+0.5)*off)
        ctx.arc(0,0,15,0,2*Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        blocks[v2k(position)]=color;
        delete blank[v2k(position)];
    }

    //把类似3_4这种转为[3,4]坐标
    function k2o(key) {
        var arr=key.split('_');
        return{x:parseInt(arr[0]),y:parseInt(arr[1])}
    }

    //在生成棋谱时生成文字样式设置
    function drawText(pos,text,color){
        ctx.save();
        ctx.font="15px 宋体";
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        if(color=='black'){
            ctx.fillStyle='white';
        }else{
            ctx.fillStyle='black';
        }
        ctx.fillText(text,(pos.x+0.5)*off,(pos.y+0.5)*off)//针对于整个canvas的位置
        ctx.restore();
    }
    //遍历blocks表，变化的i表示该棋子是第几个下的
    function review(){
       var i=1;
        for(var pos in blocks){
            drawText(k2o(pos),i,blocks[pos])
            i++;
        }

    }
    //把棋子坐标转化为类似3_4这种格式的
    function v2k(position) {
        return position.x+'_'+position.y;
    }
    function p2k(x,y) {
        return x+"_"+y;
    }
    //判断是否五子连珠
    function check(pos,color){
        var num=1;
        var cos=1;
        var m=1;
        var n=1;
        /*var max=Math.floor(Math.max(num,cos,n,m));*/
        //定义表，里面只有黑棋或只有白棋
        var table={};
        for(var i in blocks){
            if(blocks[i]==color){
                table[i]=true;
            }
        }
        //判断横着有没有到5个
        var tx=pos.x;
        var ty=pos.y;
        while(table[p2k(tx+1,ty)]){
            num++;tx++;
        }
        tx=pos.x;
        ty=pos.y;
        while(table[p2k(tx-1,ty)]){
            num++;tx--;
        }
        /*return num>=5*/
        //竖着
        while(table[p2k(tx,ty+1)]){
            cos++;ty++;
        }
        tx=pos.x;
        ty=pos.y;
        while(table[p2k(tx,ty-1)]){
            cos++;ty--;
        }
        //左斜
        while(table[p2k(tx+1,ty+1)]){
            m++;ty++;tx++;
        }
        tx=pos.x;
        ty=pos.y;
        while(table[p2k(tx-1,ty-1)]){
            m++;ty--;tx--;
        }
        //右斜
        while(table[p2k(tx+1,ty-1)]){
            n++;ty--;tx++;
        }
        tx=pos.x;
        ty=pos.y;
        while(table[p2k(tx-1,ty+1)]){
            n++;ty++;tx--;
        }
        return Math.floor(Math.max(num,cos,n,m));
    }

    var blank={};
    for(var i=0;i<ROW;i++){
        for(var j=0;j<ROW;j++){
            blank[p2k(i,j)]=true;
        }
    }
    console.log(blank)

    function AI(){
        var max1=-Infinity;
        var pos1;
        var max2=-Infinity;
        var pos2;
        for(var i in blank){
            var score1=check(k2o(i),'black');
            if(score1>max1){
                pos1=k2o(i);
                max1=score1;

            }
            var score2=check(k2o(i),'white');
            if(score2>max2){
                pos2=k2o(i);
                max2=score2;

            }
        }
        if(max2>=max1){
            return pos2;
        }else{
            return pos1;
        }

    }



    var flag=true;
    $("canvas").on("click",handleClick)

    //重新开始
    function handleClick(e) {
        var position={
            x:Math.round((e.offsetX-off/2)/off),
            y:Math.round((e.offsetY-off/2)/off)
        };
        if(blocks[v2k(position)]){return;}
        if(ai){
            drawChess(position,'black');
            drawChess(AI(),'white');
            if(check(position,"black")>=5){
                clearInterval(tt);
                alert("黑棋赢");
                if(confirm('是否生成棋谱')){
                    review();
                }
                $("canvas").off("click");
                return;
            }

                if(check(AI(),"white")>5){
                    clearInterval(tt);
                    alert("白棋赢");
                    if(confirm('是否生成棋谱')){
                        review();
                    }
                    $("canvas").off("click");
                    return;
                }
            return;
        }
        if(flag){
            drawChess(position,'black');
            if(check(position,"black")>=5){
                clearInterval(tt);
                alert("黑棋赢");
                if(confirm('是否生成棋谱')){
                    review();
                }
                $("canvas").off("click");
                return;
            }

        }else{
            drawChess(position,'white')
            if(check(position,"white")>=5){
                clearInterval(tt);
                alert("白棋赢");
                if(confirm('是否生成棋谱')){
                    review();
                }
                $("canvas").off("click");
                return;
            }
        }
        flag=!flag;

    }
    function restart() {
        ctx.clearRect(0,0,width,width);
        blocks={};
        flag=true;
        $('canvas').off('click').on('click',handleClick)
        draw();
    }
    $(".nav").on('click',function () {
        clearInterval(tt);
        $(".jsq span").html("0:00");
        restart();
    })
    var ai=false;
    $("#ai").on('click',function () {
        ai=!ai
        clearInterval(tt);
        $(".jsq span").html("0:00");
        ctx.clearRect(0,0,width,width);
        blocks={};
        draw();
        $(this).toggleClass("active");
    })
     $(".left").on("click",".one",function () {
         jishi();
     })

/*计时器*/
var hei = {};
    var bai = {};
    var kaiguan = true;
    var isAi=true;
    var time = 0;
    var  min=0;
    var second=0;
    $(".jsq span").html("0:00");
    function jishi(){
        tt=setInterval(function(){
            time +=1;
            second=time%60;
            if(time%60 == 0){
                min = parseInt(min);
                min += 1;
                min = (min<10)?'0'+min:min;
            }
            second = (second<10)?'0'+second:second;
            $(".jsq span").html(min +':'+second);

        },1000);
    }
})