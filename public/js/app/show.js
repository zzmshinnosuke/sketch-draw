"use strict";
function stroke() {
    this.color=null;
    this.thickness=1;
    this.points=[];
}
var sketch = function( p ) {
    var screen_width,screen_height; //屏幕的宽和高

    var draw_area_x,draw_area_y,draw_area_width,draw_area_height;//绘制区域左上角坐标
    var image_x,image_y,image_width,image_height;//图片区域

    var current_stroke=null;
    var strokes=[];

    //dom
    var canvas;

    var image_image;
    var save_btn;
    var next_btn;

    var no_standard_input;

    var img;

    var init=function(){

        screen_width=Math.max(window.innerWidth,480);
        screen_height=Math.max(window.innerHeight,320);

        draw_area_x=parseInt(screen_width/3);
        draw_area_y=0;

        draw_area_x=screen_width/2+10;
        draw_area_y=screen_height/2-img.height/2;
        draw_area_width=img.width;
        draw_area_height=img.height;

        image_x=screen_width/2 -10-img.width;
        image_y=screen_height/2-img.height/2;
        image_width=img.width;
        image_height=img.height;

        canvas=p.createCanvas(draw_area_width,draw_area_height);
        canvas.position(draw_area_x,draw_area_y);

        p.frameRate(120);
        p.background(255,255,255,255);

        image_image=p.createImg(Apollo.publicUrl + 'images/background/'+ Apollo.contents['filename']);
        image_image.position(image_x,image_y);
        image_image.style('width',image_width+'px');
        image_image.style('height',image_height+'px');

        save_btn=p.createButton('standard');
        save_btn.position(5,5);
        save_btn.style('width',70+'px');
        save_btn.mouseClicked(save_button_event);

        next_btn=p.createButton('next');
        next_btn.position(80,5);
        next_btn.style('width',50+'px');
        next_btn.mouseClicked(next_button_event);     

    }

    p.preload=function(){
        //var list = JSON.parse(Apollo.contents);
        var rootFolder = Apollo.publicUrl + 'images/background/';
        //加载图片文件
        img=p.loadImage(rootFolder + Apollo.contents['filename']);
        //alert(Apollo.contents['filename']);
        for(var i=0;i<Apollo.contents['new'].length;i++)
        {
            var temp=Apollo.contents['new'][i];
            
            current_stroke=new stroke();
            current_stroke.thickness=temp["thickness"];
            current_stroke.points=current_stroke.points.concat(temp["points"]);
            current_stroke.color=(0,0,0);
            strokes.push(current_stroke);
            //console.log(strokes);
        }
    }

    p.setup = function() {
        init();
        redraw_screen();
    };

    p.draw = function() {
    };

    var redraw_screen = function () {
        if (strokes && strokes.length > 0) {
            //draw_example(strokes_image);
            draw_example(strokes);
        }
    };

    //从保存的笔画数组中绘制所有的笔画在画板上
    var draw_example = function(example) {
        for(var i=0;i<example.length;i++) {
            // sample the next pen's states from our probability distribution
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

    var submit1= function(){
        var d = new Date();
        Apollo.suffix = d.toLocaleDateString().toString().replace('/', "_").replace('/', "_")  + "_" + d.toLocaleTimeString().replace(":", "_").replace(":", "_").replace(" ", "");
        var imgCanvas = document.getElementById('defaultCanvas0'); // get the canvas created by p5js
        var device=[img.width,img.height];
        var result=JSON.stringify({"filename":Apollo.contents['filename'],"device":device,"strokes":strokes});
        var md5_verify=md5(result);
        var postData = {
            task: Apollo.task,
            save: 2,
            suffix: Apollo.suffix,
            md5: md5_verify,
            json: result,
        };
        $.ajax({
            type: "POST",
            url: Apollo.baseUrl,
            data: postData,
            success: function (data, status, jqXHR) {
                if(md5_verify==data)
                {
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

    var submit_no_standard= function(){
        var postData = {
            task: Apollo.task,
            reason: 1,
            json: JSON.stringify({"reason":no_standard_input.value()}),
        };
        $.ajax({
            type: "POST",
            url: Apollo.baseUrl,
            data: postData,
            success: function (data, status, jqXHR) {
                alert("success");
            },
            error: function (data, status, jqXHR) {
                alert("false");
            },
        });    
    }

    var next_button_event=function(){
        var task=Apollo.task+1;
        if (task < 0 || task > 1e5)
		return;
	    window.location.href = Apollo.baseUrl+"?show=1" + "&task=" + task;
    };

    var save_button_event=function(){
        submit1();
    };
    
    var no_standard_button_event=function(){
        if(no_standard_input.value()!="")
            submit_no_standard();
        else
            alert("请输入原因");
    };

};

var custom_p5 = new p5(sketch, 'sketch');


