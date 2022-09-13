"use strict";
function stroke() {
    this.color=null;
    this.thickness=1;
    this.points=[];
}
function stroke_draw() {
    this.color=null;
    this.thickness=1;
    this.points=[];
    this.bounding_x1=10000;
    this.bounding_y1=10000;
    this.bounding_x2=0;
    this.bounding_y2=0;   
}
var sketch = function( p ) {
 
    var screen_width, screen_height; //屏幕的宽和高

    var start_x, start_y; //绘制起始位置坐标
    var draw_area_x, draw_area_y, draw_area_width, draw_area_height; //绘制区域左上角坐标
    var image_x, image_y, image_width, image_height; //图片区域
    var operate_x, operate_y;

    var has_started=false; //set to true after user starts writing
    var just_finished_line = false; //

    var current_stroke=null;
    var strokes=[];
    var current_raw_line=[]; //save user drawing line
    var scene = "field";
    var drawer = -1;

    var pen = 0; //当前笔的状态，1抬笔，0落笔
    var pre_pen = 1;//前一笔的状态，1抬笔，0落笔
    var x, y; // absolute coordinates on the screen of where the pen is
    var epsilon = 1; // to ignore data from user's pen staying in one spot.
    var dx, dy; // offsets of the pen strokes, in pixels
    var raw_line_color; //线条颜色

    var is_guide=false; //是否有参考线
    var guide_nums=3; //参考线条数

    var ratio=1.0; //图片和绘制区比例。

    var is_eraser_pen=0; //0 pen, 1 eraser

    //dom
    var canvas;
    var reset_button;
    
    var undo_btn
    var guide_btn;
    var eraser_btn;
    var pen_btn;

    var save_btn;
    var next_btn;
    var load_btn;

    var thickness_slider;
    var guide_slider;

    var img;

    var thickness_user=1; //笔画粗细
    var eraser_points=[];

    var init=function(){

        screen_width=Math.max(window.innerWidth,480);
        screen_height=Math.max(window.innerHeight,320);

        operate_x=5;
        operate_y=25;

        draw_area_x=parseInt(screen_width/3);
        draw_area_y=0;

        var d_width=screen_width-draw_area_x;
        var d_height=screen_height-draw_area_y;
        if(img.width/img.height>d_width/d_height)
        {
            draw_area_width=d_width;
            draw_area_height=d_width*img.height/img.width;
            ratio=(img.width+0.0)/draw_area_width;
        }
        else
        {
            draw_area_height=d_height;
            draw_area_width=d_height*img.width/img.height;
            ratio=(img.height+0.0)/draw_area_height;
        } 
        
        //参考图像的起始坐标
        image_x=0;
        image_y=230;
        
        //参考图像的缩放
        var d_width=draw_area_x;
        var d_height=screen_height-300;
        if(img.width/img.height>d_width/d_height)
        {
            image_width=d_width;
            image_height=d_width*img.height/img.width;
        }
        else
        {
            image_height=d_height;
            image_width=d_height*img.width/img.height;
        }

        canvas=p.createCanvas(screen_width,screen_height);
        canvas.position(0,0);

        var mo=function(e){
            e.preventDefault();};
        function stop(){
            canvas.style.overflow='hidden';
            canvas.touchMoved(mo,{passive:false});//禁止页面滑动
        }
        //直接默认不让滑动
        stop();

        p.frameRate(120);
        p.background(255,255,255,255);

        var Scene1=p.createP("Scene  "+ Apollo.task);
        Scene1.position(5,0);

        save_btn=p.createButton('save');
        save_btn.position(5,operate_y+20);
        save_btn.style('width',50+'px');
        save_btn.mouseClicked(save_button_event);

        next_btn=p.createButton('next');
        next_btn.position(65,operate_y+20);
        next_btn.style('width',50+'px');
        next_btn.mouseClicked(next_button_event);

        load_btn=p.createButton('load');
        load_btn.position(125,operate_y+20);
        load_btn.style('width',50+'px');
        load_btn.mouseClicked(load_button_event);

        reset_button=p.createButton('clear');
        reset_button.position(5,operate_y+65);
        reset_button.style('width',50+'px');
        reset_button.mouseClicked(reset_button_event);

        guide_btn=p.createButton('guide');
        guide_btn.position(65,operate_y+65);
        guide_btn.style('width',50+'px');
        guide_btn.mouseClicked(guide_button_event);

        undo_btn=p.createButton('undo');
        undo_btn.position(125,operate_y+65);
        undo_btn.style('width',50+'px');
        undo_btn.mouseClicked(undo_button_event);

        eraser_btn=p.createButton('eraser');
        eraser_btn.position(185,operate_y+65);
        eraser_btn.style('width',50+'px');
        eraser_btn.mouseClicked(eraser_button_event);

        pen_btn=p.createButton('pen');
        pen_btn.position(245,operate_y+65);
        pen_btn.style('width',50+'px');
        pen_btn.mouseClicked(pen_button_event);

        thickness_slider=p.createSlider(0,10,1);
        thickness_slider.position(5,operate_y+100);
        thickness_slider.style('width',draw_area_x-50+'px');
        thickness_slider.changed(thickness_slider_event);

        guide_slider=p.createSlider(1,10,1);
        guide_slider.position(5,operate_y+135);
        guide_slider.style('width',draw_area_x-50+'px');
        guide_slider.changed(guide_slider_event);

        redraw_screen();
    }

    var load= function (_task = -1) {
        var _backup = 0;  
        if (_task == -1) {
            _task = Apollo.task;
            Apollo.backup = null;
        } else {
            _backup = 1;
            Apollo.backup = _task;
        }
    
        var postData = {
            load: 1,
            task: _task,
            backup: _backup
        };
        $.ajax({
            type: "POST",
            url: Apollo.baseUrl,
            data: postData,
            success: function (data, status, jqXHR) {
                if (data === "0")
                    return;
                var list = JSON.parse(data);
                scene = list["scene"];
                drawer = list["drawer"];
                if (list.length == 0)
                    return;
                for(var i=0;i<list['strokes'].length;i++)
                {
                    var temp=list['strokes'][i];
                    var points=[];
                    current_stroke=new stroke_draw();
                    for(var j=0;j<temp['points'].length;j++)
                    {
                        var temp_x=temp['points'][j][0]/ratio+draw_area_x;
                        var temp_y=temp['points'][j][1]/ratio+draw_area_y;
                        if(current_stroke.bounding_x1>temp_x){
                            current_stroke.bounding_x1=temp_x; 
                        }
                        if(current_stroke.bounding_x2<temp_x){
                            current_stroke.bounding_x2=temp_x; 
                        }
                        if(current_stroke.bounding_y1>temp_y){
                            current_stroke.bounding_y1=temp_y; 
                        }
                        if(current_stroke.bounding_y2<temp_y){
                            current_stroke.bounding_y2=temp_y; 
                        }
                        points.push([temp_x,temp_y]);
                    }
                    
                    current_stroke.thickness=temp["thickness"];
                    current_stroke.points=current_stroke.points.concat(points);
                    current_stroke.color=(0,0,0);
                    strokes.push(current_stroke);
                } 
                redraw_screen();
            },
            error: function (data, status, jqXHR) {
                alert('fail');
            },
        });
    }

    p.preload=function(){
        var rootFolder = Apollo.publicUrl + 'images/background/';
        //加载图片文件
        img=p.loadImage(rootFolder + Apollo.reference);
    }

    p.setup = function() {
        init();
        restart();
        //load();
        redraw_screen();
    };

    p.draw = function() {
        process_user_input();
        
    };

    var process_user_input = function () {
        if(is_eraser_pen==1)
        {
            if ((p.touchIsDown||p.mouseIsPressed)&&(p.mouseX >= draw_area_x)&&(p.mouseX <= draw_area_x+draw_area_width)&& (p.mouseY >= draw_area_y) && (p.mouseY <= draw_area_y+draw_area_height)) // pen is touching the paper
            {
                p.stroke('white'); // Change the color
                p.strokeWeight(10); // Make the points 10 pixels in size
                p.point(p.mouseX, p.mouseY);
                var flag=true;
                for(var i = 0; i < eraser_points.length; i++){
                    if(p.mouseX == eraser_points[i][0]&&p.mouseY == eraser_points[i][1]){
                        flag=false;
                    }
                }
                if(flag)
                    eraser_points.push([p.mouseX, p.mouseY]);   
            }
            else{
                if(eraser_points.length>0)
                    eraser_stroke();
                eraser_points=[];
                redraw_screen();
            }
        }
        else{
            // record pen drawing from user:
            if ((p.touchIsDown||p.mouseIsPressed)&&(p.mouseX >= draw_area_x)&&(p.mouseX <= draw_area_x+draw_area_width)&& (p.mouseY >= draw_area_y) && (p.mouseY <= draw_area_y+draw_area_height)) { // pen is touching the paper
                //console.log(p.mouseX,p.mouseY);
                if (has_started == false) { // first time anything is written
                    has_started = true;
                    x = p.mouseX;
                    y = p.mouseY;
                    start_x = x;
                    start_y = y;
                    pen = 0;
                    current_raw_line.push([x, y]);
                    
                } else {
                    //console.log(start_x,start_y);
                    if (pen == 1) {
                        //redraw_screen();
                    }
                    var dx0 = p.mouseX-x; // candidate for dx
                    var dy0 = p.mouseY-y; // candidate for dy
                    if (dx0*dx0+dy0*dy0 >= epsilon*epsilon) { // only if pen is not in same area
                        dx = dx0;
                        dy = dy0;
                        pen = 0;
                        if (pre_pen == 0) {
                            draw_user_strokes(x, y, dx, dy);
                        }

                        // update the absolute coordinates from the offsets
                        x += dx;
                        y += dy;

                        // update raw_lines
                        current_raw_line.push([x, y]);
                        just_finished_line = true;
                    }
                }
            }
            else { // pen is above the paper
                pen = 1;
                if (just_finished_line) {
                    var current_raw_line_simple = DataTool.simplify_line(current_raw_line);
                    if (current_raw_line_simple.length > 1) {
                        current_stroke=new stroke_draw();
                        for(var i=0;i<current_raw_line.length;i++)
                        {
                            if(current_stroke.bounding_x1>current_raw_line[i][0])
                                current_stroke.bounding_x1=current_raw_line[i][0]
                            if(current_stroke.bounding_x2<current_raw_line[i][0])
                                current_stroke.bounding_x2=current_raw_line[i][0]
                            if(current_stroke.bounding_y1>current_raw_line[i][1])
                                current_stroke.bounding_y1=current_raw_line[i][1]
                            if(current_stroke.bounding_y2<current_raw_line[i][1])
                                current_stroke.bounding_y2=current_raw_line[i][1]
                        }
                        current_stroke.points=current_stroke.points.concat(current_raw_line);
                        current_stroke.color=raw_line_color;
                        current_stroke.thickness=thickness_user;
                        strokes.push(current_stroke);
                    }
                    else {
                        if (strokes.length === 0) {
                            has_started = false;
                        }
                    }
                    current_raw_line = [];
                    just_finished_line = false;
                }
            }
            pre_pen = pen;
        }
    };

    var draw_user_strokes = function(x, y, dx, dy) {
        // draw on large main screen
        p.strokeWeight(thickness_user); // nice thick line
        p.stroke(raw_line_color);
        p.line(x, y, x+dx, y+dy); // draw line connecting prev point to current point.
    };

    var get_boundingbox=function(points){
        var x1=Number.MAX_SAFE_INTEGER;
        var x2=0;
        var y1=Number.MAX_SAFE_INTEGER;
        var y2=0;
        for(var i=0;i<points.length;i++){
            if(x1>points[i][0]){
                x1=points[i][0];
            }
            if(x2<points[i][0]){
                x2=points[i][0];
            }
            if(y1>points[i][1]){
                y1=points[i][1];
            }
            if(y2<points[i][1]){
                y2=points[i][1];
            }
        }
        return [x1,y1,x2,y2];
    }

    var eraser_stroke=function(){
        // 判断删除位置与每一条笔画是否靠近，删除位置在笔画的位置，如果是两端可以直接擦除，如果是中间会生成新的笔画。
        // 所以如果中间被截断的话，产生两条笔画，还是在相同的位置，会改变后面笔画的位置。
        var new_strokes=[];
        for(var i=0;i<strokes.length;i++)
        {
            var temp_stroke=strokes[i];
            var ischange=false;
            var delete_position=[]; 
            for(var j=0;j<eraser_points.length;j++)
            {
                var eraser_point=eraser_points[j];                  
                for(var k=0;k<temp_stroke.points.length;k++)
                {
                    var point=temp_stroke.points[k]; 
                                
                    if(Math.abs(eraser_point[0]-point[0])<=3&&Math.abs(eraser_point[1]-point[1])<=3)
                    { 
                        ischange=true;
                        if(!delete_position.includes(k))
                            delete_position.push(k);
                    }
                }    
            }
            delete_position.push(temp_stroke.points.length);
            delete_position.sort(function(a,b){return a>b?1:-1});
            if(ischange)
            {
                var start=0;
                for(var m=0;m<delete_position.length;m++)
                {
                    if(delete_position[m]-start>2)
                    {
                        var split_stroke=new stroke_draw();
                        split_stroke.color=temp_stroke.color;
                        split_stroke.thickness=temp_stroke.thickness;
                        split_stroke.points=split_stroke.points.concat(temp_stroke.points.slice(start,delete_position[m]));
                        new_strokes.push(split_stroke);
                    }
                    start=delete_position[m]+1;
                }
            }
            else
            {
                var split_stroke=new stroke_draw();
                split_stroke.color=temp_stroke.color;
                split_stroke.thickness=temp_stroke.thickness;
                split_stroke.points=split_stroke.points.concat(temp_stroke.points);
                new_strokes.push(split_stroke);
            }               
        }
        strokes=[];
        strokes=new_strokes;
    };

    var redraw_screen = function () {

        p.background(255,255,255,255);
        p.fill(255,255,255,255);
        p.image(img,image_x,image_y,image_width,image_height);

        p.stroke(0.25);
        p.strokeWeight(0.25);
        p.rect(draw_area_x,draw_area_y,draw_area_width,draw_area_height);

        if(is_guide)
        {
            p.stroke(p.color(255, 0, 0, 200));
            p.strokeWeight(0.5);
            for(var i=1;i<=guide_nums;i++)
            {
                p.line(image_x+image_width*i/(guide_nums+1),image_y,image_x+image_width*i/(guide_nums+1),image_y+image_height);
                p.line(image_x,image_y+image_height*i/(guide_nums+1),image_x+image_width,image_y+image_height*i/(guide_nums+1));

                p.line(draw_area_x+draw_area_width*i/(guide_nums+1),draw_area_y,draw_area_x+draw_area_width*i/(guide_nums+1),draw_area_y+draw_area_height);
                p.line(draw_area_x,draw_area_y+draw_area_height*i/(guide_nums+1),draw_area_x+draw_area_width,draw_area_y+draw_area_height*i/(guide_nums+1));
            }
        }
        if (strokes && strokes.length > 0) {
            draw_example(strokes);
        }
    };

    //从保存的笔画数组中绘制所有的笔画在画板上
    var draw_example = function(example) {

        for(var i=0;i<example.length;i++) {
            var temp_stroke = example[i];
            p.strokeWeight(temp_stroke.thickness);
            p.stroke(temp_stroke.color);
            for(var j=0;j+1<temp_stroke.points.length;j++)
            {
                var point=temp_stroke.points[j];
                var point_next=temp_stroke.points[j+1];
                p.line(point[0], point[1], point_next[0], point_next[1]);
            }
        }
    };

    var restart = function () {
        raw_line_color = (0,0,0)//p.color(0, 0, 0, 255);

        x = 0;
        y = 0;
        has_started = false;

        strokes = [];
        current_raw_line = [];
        redraw_screen();
    };

    var submit1= function(){
        var d = new Date();
        Apollo.suffix = d.toLocaleDateString().toString().replace('/', "_").replace('/', "_")  + "_" + d.toLocaleTimeString().replace(":", "_").replace(":", "_").replace(" ", "");
        var imgCanvas = document.getElementById('defaultCanvas0'); // get the canvas created by p5js
        var device=[screen_width,screen_height,draw_area_x,draw_area_y,draw_area_width,draw_area_height];
        var resolution=[img.width,img.height];
        var new_strokes=[];
        for(var i=0;i<strokes.length;i++)
        {
            var temp=strokes[i];
            var current_stroke_image=new stroke();
            current_stroke_image.thickness=temp.thickness;
            current_stroke_image.color=temp.color;
            for(var j=0;j<temp.points.length;j++)
            {
                current_stroke_image.points.push([(temp.points[j][0]-draw_area_x)*ratio,(temp.points[j][1]-draw_area_y)*ratio]);
            }      
            new_strokes.push(current_stroke_image);
        } 
        var result=JSON.stringify({"reference":Apollo.reference, "device":device, "resolution":resolution, "scene":scene, "drawer":drawer, "origin_strokes":strokes, "strokes":new_strokes });
        var md5_verify=md5(result);
        // alert(md5_verify);
        var postData = {
            task: Apollo.task,
            save: 1,
            suffix: Apollo.suffix,
            md5: md5_verify,
            json: result,         
            // img_val: imgCanvas.toDataURL("image/png"),
        };
        $.ajax({
            type: "POST",
            url: Apollo.baseUrl,
            data: postData,
            success: function (data, status, jqXHR) {
                // alert(data);
                if(data==md5_verify){
                    alert("SUCCESS!");
                }             
                else{
                    alert("Please Save Again!");
                }
            },
            error: function (data, status, jqXHR) {
                alert("false");
            },
        });   
    };

    var reset_button_event = function() {
        restart();
    };

    var guide_button_event = function() {
        if(is_guide){
            is_guide=false;
        }
        else {
            is_guide = true;
        }
        redraw_screen();
    };

    var thickness_slider_event=function () {
        thickness_user=thickness_slider.value();
        redraw_screen();
        //alert(thickness_user);
    };

    var guide_slider_event =function () {
        guide_nums=guide_slider.value();
        redraw_screen();
    };

    var undo_button_event=function(){

        if(strokes.length>0)
        {
            strokes.pop();
        }
        redraw_screen();
    };

    var next_button_event=function(){
        var task=Apollo.task+1;
        if (task < 0 || task > 1e5)
		return;
	    window.location.href = Apollo.baseUrl + "?task=" + task;
    };

    var save_button_event=function(){
        if (strokes&&strokes.length > 3) {
            submit1();
            return;
        }
        else{
            alert("请认真绘制后再保存！笔画数需要大于3条！");  
        }  
    };

    var load_button_event=function(){
        if (strokes&&strokes.length > 0) {
            alert("清空画板后才可以装载已绘制的草图！");  
        }
        else{
            load();
            redraw_screen();
        }  
    };

    var eraser_button_event=function(){
        is_eraser_pen=1;
        document.getElementById("defaultCanvas0").style.cursor = "url("+Apollo.publicUrl + 'css/images/eraser.png'+") 0 0,pointer";
    };

    var pen_button_event=function(){
        is_eraser_pen=0;
        document.getElementById("defaultCanvas0").style.cursor ="";
    };
};

//var custom_p5 = new p5(sketch, 'sketch');
document.oncontextmenu = function(){
    return false;
}

document.onselectstart = function(){
    return false;
}



