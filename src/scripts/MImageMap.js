/***
MImageMap
Version: 1.0beta (04.09.2019)

Copyright 2013-2019 Rogachov Viktor

https://bitbucket.org/gmdevru/
https://bitbucket.org/gmdevru/myui-mimagemap

A JS library to enhance image maps.
***/

export default class MImageMap
{
    constructor( options )
    {
        this.events     = { CLICK : 'click', MOUSEOVER : 'mouseover', MOUSEOUT : 'mouseout', MOUSEENTER : 'mouseenter', MOUSELEAVE : 'mouseleave', MOUSEMOVE : 'mousemove' };
        this.states     = { DEFAULT : 'DEFAULT', SELECTED : 'SELECTED', DISABLED : 'DISABLED', DISABLED_HOVERED : 'DISABLED_HOVERED', HOVERED : 'HOVERED', SELECTED_HOVERED : 'SELECTED_HOVERED' };
        this.image_list = [];
        this.head       = document.head;
        this.body       = document.body;
        this.html       = document;
        this.html_body  = document.querySelector( 'html, body' );
        this.document   = document;
        this.window     = window;
        this.has_canvas = null;

        this.options    =
        {
              SELECTOR             : 'img:not(.MImageMap-processed)',

              CLS_IMG_MAIN         : 'image-main', // img with usemap=""
              CLS_IMG_FAKE         : 'image-fake', // new generated image for background default view
              CLS_PROCESSED        : 'MImageMap-processed',

              // stroke styles
              STROKE_HOV_COLOR     : '#000', // hovered  state
              STROKE_HOV_WIDTH     : 1,      // hovered  state
              STROKE_DIS_COLOR     : '#fff', // disabled state
              STROKE_DIS_WIDTH     : 0,      // disabled state
              STROKE_DIS_HOV_COLOR : '#ccc', // disabled+hovered state
              STROKE_DIS_HOV_WIDTH : 0,      // disabled+hovered state
              STROKE_SEL_COLOR     : '#fff', // selected state
              STROKE_SEL_WIDTH     : 0,      // selected state
              STROKE_SEL_HOV_COLOR : '#fff', // selected+hovered state
              STROKE_SEL_HOV_WIDTH : 0,      // selected+hovered state
              STROKE_DEF_COLOR     : 0,      // default state
              STROKE_DEF_WIDTH     : 0,      // default state

              FILL_DEF_CLR         : '#0',   // default  state fill
              FILL_HOV_CLR         : '#786f6e', // hovered  state fill
              FILL_DIS_CLR         : '#ccc', // disabled state fill
              FILL_DIS_HOV_CLR     : '#fff', // disabled state fill
              FILL_SEL_CLR         : '#db0933', // selected state fill
              FILL_SEL_HOV_CLR     : '#db0933', // selected+hovered state fill

              ATTR_AREA_ID         : 'data-id'
        };

    } // constructor


    _Skin( selector )
    {
        let _selector   = !selector ? this.options.SELECTOR : selector;
        let _new_images = Array.from( document.querySelectorAll( _selector ) );

        if( _new_images.length < 1 ) return;

        this.image_list.push( _new_images );

        _new_images.forEach((_el)=>{
        
            let _img_map   = document.querySelector( 'map[name=' + _el.attributes['usemap'].value.substring(1) + ']' );
            let _area_list = Array.from( _img_map.querySelectorAll( 'area' ) );
            let _canvas    = document.createElement('canvas');
            let _img_fake  = _el.cloneNode(true);

            _el.classList.add( this.options.CLS_PROCESSED );

            _canvas.setAttribute( "width",  _el.attributes['width'] .value );
            _canvas.setAttribute( "height", _el.attributes['height'].value );

            _el.parentNode.appendChild( _canvas );

            _el      .classList.add   ( this.options.CLS_IMG_MAIN );
            _img_fake.classList.remove( this.options.CLS_IMG_MAIN );
            _img_fake.classList.add   ( this.options.CLS_IMG_FAKE );

            _canvas.parentNode.appendChild( _img_fake );

            let _obj                 = new MImageMapItem();
                _obj.jqo_image       = _el;
                _obj.jqo_image_fake  = _img_fake;
                _obj.jqo_map         = _img_map;
                _obj.jqo_area_list   = _area_list;
                _obj.canvas          = _canvas;
                _obj.canvas_context  = _obj.canvas.getContext('2d');
                _obj.jqo_canvas      = _canvas;
                _obj.region_state    = this.states.DEFAULT;
                _obj.jqo_image_fake  = _img_fake;
                _obj.image_real_size = { w:_obj.jqo_image.attributes['width'].value, h:_obj.jqo_image.attributes['height'].value };

            _obj.jqo_image.obj_mimagemap = _obj;

            _obj.jqo_area_list.forEach
            (
                (_el)=>
                {
                    _el.obj_mimagemap            = _obj;
                    _el.obj_mimagemap_coords_or  = _el.coords.replace(' ', '').replace('\n', '');
                    _el.obj_mimagemap_coords     = _el.obj_mimagemap_coords_or.split(',');
                    _el.obj_mimagemap_state      = this.states.DEFAULT;
                    _el.obj_mimagemap_rect_minxy = [0,0];

                    for( var x = 0; x < _el.obj_mimagemap_coords.length; x++ )
                    {
                        _el.obj_mimagemap_coords[x] = parseInt( _el.obj_mimagemap_coords[x] );
                    }

                    this._CalcShapeRect( _el );

                    _el.addEventListener( this.events.MOUSEOVER, this._OnAreaEnter(this) );
                    _el.addEventListener( this.events.MOUSEOUT, this._OnAreaLeave(this) );
                    _el.addEventListener( this.events.CLICK,      this._OnAreaClick(this) );
        
                    if( !!_el.attributes["data-state"] )
                    {
                        _el.obj_mimagemap_state = this.states[ _el.attributes["data-state"].value ];
                    }
                }
            );

            _el.style["opacity"] = 0;

            _el .addEventListener( this.events.MOUSEENTER, this._OnImageEnter );
            _el .addEventListener( this.events.MOUSELEAVE, this._OnImageLeave );

            this._UpdateView( _obj );

        });

    } // _Skin



    _CalcShapeRect( area )
    {
        switch( area.shape.toLowerCase() )
        {
        case 'poly':
            area.obj_mimagemap_rectx      = this._Util_GetMinX ( area.obj_mimagemap_coords );
            area.obj_mimagemap_rectw      = this._Util_GetMaxX ( area.obj_mimagemap_coords ) - area.obj_mimagemap_rectx;
            area.obj_mimagemap_recty      = this._Util_GetMinY ( area.obj_mimagemap_coords );
            area.obj_mimagemap_recth      = this._Util_GetMaxY ( area.obj_mimagemap_coords ) - area.obj_mimagemap_recty;
            area.obj_mimagemap_rect_minxy = this._Util_GetMinXY( area.obj_mimagemap_coords );
            break;

        case 'rect':
            area.obj_mimagemap_rectx      = area.obj_mimagemap_coords[0];
            area.obj_mimagemap_rectw      = area.obj_mimagemap_coords[2] - area.obj_mimagemap_coords[0];
            area.obj_mimagemap_recty      = area.obj_mimagemap_coords[1];
            area.obj_mimagemap_recth      = area.obj_mimagemap_coords[3] - area.obj_mimagemap_coords[1];
            area.obj_mimagemap_rect_minxy = [ area.obj_mimagemap_rectx + area.obj_mimagemap_rectw/2, area.obj_mimagemap_recty ];
            break;

        case 'circ':
        case 'circle':
            area.obj_mimagemap_rectx      = area.obj_mimagemap_coords[0] - area.obj_mimagemap_coords[2];
            area.obj_mimagemap_rectw      = area.obj_mimagemap_coords[2] * 2;
            area.obj_mimagemap_recty      = area.obj_mimagemap_coords[1] - area.obj_mimagemap_coords[2];
            area.obj_mimagemap_recth      = area.obj_mimagemap_coords[2] * 2;
            area.obj_mimagemap_rect_minxy = [ area.obj_mimagemap_rectx + area.obj_mimagemap_coords[2], area.obj_mimagemap_recty ];
            break;
        }

    } // _CalcShapeRect



    // call after makeing all operations
    // simple update view part of map
    _UpdateView( obj )
    {
        let _obj = obj;
    
        this._ClearCanvas( _obj );

        _obj.jqo_area_list.forEach((_el)=>{
        
            let _region         = _el,
                _region_coords  = _region.obj_mimagemap_coords,
                _region_context = _obj.canvas_context,
                _region_state   = _region.obj_mimagemap_state,
                _fill_style     = this.options.FILL_HOV_CLR,
                _stroke_width   = this.options.STROKE_HOV_WIDTH,
                _stroke_style   = this.options.STROKE_HOV_COLOR;

            switch( _region_state )
            {
            case this.states.DEFAULT:
                _fill_style   = this.options.FILL_DEF_CLR;
                _stroke_width = this.options.STROKE_DEF_COLOR;
                _stroke_style = this.options.STROKE_DEF_WIDTH;
                break;

            case this.states.HOVERED:
                _fill_style   = this.options.FILL_HOV_CLR;
                _stroke_width = this.options.STROKE_HOV_WIDTH;
                _stroke_style = this.options.STROKE_HOV_COLOR;
                break;

            case this.states.SELECTED:
                _fill_style   = this.options.FILL_SEL_CLR;
                _stroke_width = this.options.STROKE_SEL_WIDTH;
                _stroke_style = this.options.STROKE_SEL_COLOR;
                break;

            case this.states.SELECTED_HOVERED:
                _fill_style   = this.options.FILL_SEL_HOV_CLR;
                _stroke_width = this.options.STROKE_SEL_HOV_WIDTH;
                _stroke_style = this.options.STROKE_SEL_HOV_COLOR;
                break;

            case this.states.DISABLED:
                _fill_style   = this.options.FILL_DIS_CLR;
                _stroke_width = this.options.STROKE_DIS_WIDTH;
                _stroke_style = this.options.STROKE_DIS_COLOR;
                break;

            case this.states.DISABLED_HOVERED:
                _fill_style   = this.options.FILL_DIS_HOV_CLR;
                _stroke_width = this.options.STROKE_DIS_HOV_WIDTH;
                _stroke_style = this.options.STROKE_DIS_HOV_COLOR;
                break;

            } // switch states

            _region.obj_imagemap_fill_color   = _fill_style;
            _region.obj_imagemap_stroke_width = _stroke_width;
            _region.obj_imagemap_stroke_color = _stroke_style;

            this._RenderShape( _region );

        });

    } // _UpdateView



    _ClearCanvas( obj )
    {
        obj.canvas_context.clearRect( 0, 0, obj.canvas.width, obj.canvas.height );

    } // _ClearCanvas



    // main shape render function
    _RenderShape( _region )
    {
        this._RenderShapeCanvas( _region );

    } // _RenderShape



    // canvas render helper
    _RenderShapeCanvas( _region )
    {
        let _obj     = _region.obj_mimagemap;
        let _coords  = _region.obj_mimagemap_coords;
        let _context = _obj.canvas_context;

        _context.beginPath();
    
        switch( _region.shape )
        {
        case 'poly':

            _context.moveTo( _coords[0], _coords[1] );

            for( let x = 2; x < _coords.length; x+=2 )
                _context.lineTo( _coords[x], _coords[x+1] );

            _context.lineTo( _coords[0], _coords[1] );

            break;

        case 'rect':
            _context.rect( _coords[0], _coords[1], _coords[2]-_coords[0], _coords[3]-_coords[1] );
            break;

        case 'circ':
        case 'circle':
            _context.arc( _coords[0], _coords[1], _coords[2], 0, 2 * Math.PI, false );
            break;
        }

        _context.closePath();

        if( _region.obj_imagemap_stroke_width > 0 )
        {
            _context.lineWidth   = _region.obj_imagemap_stroke_width;
            _context.strokeStyle = _region.obj_imagemap_stroke_color;
            _context.stroke();
        }

        if( _region.obj_imagemap_fill_color.length > 3 )
        {
            _context.fillStyle = _region.obj_imagemap_fill_color;
            _context.fill();
        }

    } // _RenderShape



    // left X coord for area
    _Util_GetMinX( coords )
    {
        let _out = 999999;

        for( let x = 0; x < coords.length; x+=2 )
            _out = Math.min( _out, coords[x] );

        return parseInt( _out );

    } // _Util_GetMinX



    // right X coord for area
    _Util_GetMaxX( coords )
    {
        let _out = -999999;

        for( let x = 0; x < coords.length; x+=2 )
            _out = Math.max( _out, coords[x] );

        return parseInt( _out );

    } // _Util_GetMaxX



    // top Y coord for area
    _Util_GetMinY( coords )
    {
        let _out = 999999;

        for( let x = 1; x < coords.length; x+=2 )
            _out = Math.min( _out, coords[x] );

        return parseInt( _out );

    } // _Util_GetMinY



    // bottom Y coord for area
    _Util_GetMaxY( coords )
    {
        let _out = -999999;

        for( let x = 1; x < coords.length; x+=2 )
            _out = Math.max( _out, coords[x] );

        return parseInt( _out );

    } // _Util_GetMaxY



    // returns coords for highest dot in area
    _Util_GetMinXY( coords )
    {
        let _ret = { x:-1, y:999999 };
        for( let x = 1; x < coords.length; x+=2 )
    {
            if( coords[x] < _ret.y )
            {
                _ret.y = coords[x];
                _ret.x = coords[x-1];
            }
    }

        _ret.x = parseInt( _ret.x );
        _ret.y = parseInt( _ret.y );

        return [ _ret.x, _ret.y ];

    } // _Util_GetMaxXY



    // area click handler, yep!
    _OnAreaClick(_class)
    {
        return function(e)
        {
            e.preventDefault();

            if( this.obj_mimagemap_state == _class.states.DISABLED || this.obj_mimagemap_state == _class.states.DISABLED_HOVERED ) return;

            this.obj_mimagemap.del_on_area_click_before( this );

            this.obj_mimagemap_state = this.obj_mimagemap_state == _class.states.SELECTED_HOVERED ? _class.states.HOVERED : _class.states.SELECTED_HOVERED;

            this.obj_mimagemap.del_on_area_click_after( this );

            _class._UpdateView( this.obj_mimagemap );
        }

    } // _OnAreaClick



    // area mouse enter handler
    _OnAreaEnter(_class)
    {
        return function(e)
        {
            e.preventDefault();

            this.obj_mimagemap.del_on_area_enter_before( this );

            switch( this.obj_mimagemap_state )
            {
            case _class.states.DEFAULT:
                this.obj_mimagemap_state = _class.states.HOVERED;
                break;

            case _class.states.SELECTED:
                this.obj_mimagemap_state = _class.states.SELECTED_HOVERED;
                break;

            case _class.states.DISABLED:
                this.obj_mimagemap_state = _class.states.DISABLED_HOVERED;
                break;
            }

            this.obj_mimagemap.del_on_area_enter_after( this );

            _class._UpdateView( this.obj_mimagemap );
        }

    } // _OnAreaEnter



    // area mouse exit handler
    _OnAreaLeave(_class)
    {
        return function(e)
        {
            e.preventDefault();

            this.obj_mimagemap.del_on_area_leave_before( this );

            switch( this.obj_mimagemap_state )
            {
            case _class.states.HOVERED:
                this.obj_mimagemap_state = _class.states.DEFAULT;
                break;

            case _class.states.SELECTED_HOVERED:
                this.obj_mimagemap_state = _class.states.SELECTED;
                break;

            case _class.states.DISABLED_HOVERED:
                this.obj_mimagemap_state = _class.states.DISABLED;
                break;
            }
    
            this.obj_mimagemap.del_on_area_leave_after( this );

            _class._UpdateView( this.obj_mimagemap );
        }

    } // _OnAreaLeave



    // main image mouse enter handler
    _OnImageEnter(e)
    {
        e.preventDefault();

        this.obj_mimagemap.del_on_map_enter_before( this );

        this.obj_mimagemap.del_on_map_enter_after( this );

    } // _OnImageEnter



    // main image mouse exit handler
    _OnImageLeave(e)
    {
        e.preventDefault();

        this.obj_mimagemap.del_on_map_leave_before( this );

        this.obj_mimagemap.del_on_map_leave_after( this );

    } // _OnImageLeave



    /*///    PUBLIC    ///*/



    SetOptions( new_options )
    {
        if( typeof new_options == "object" )
        for( let i in new_options )
          this.options[i] = new_options[i];

    } // SetOptions



    Skin( selector )
    {
        this._Skin( selector );

    } // Skin



    // resize full map and recalculate areas
    Resize( image, w )
    {
        image.obj_mimagemap.del_on_map_resize_before();

        // full of magic
        let _obj   = image.obj_mimagemap;
        let _ratio = w/_obj.image_real_size.w;

        _obj.jqo_image     .removeAttribute('height');
        _obj.jqo_image_fake.removeAttribute('height');

        _obj.jqo_image     .width  = w;
        _obj.jqo_image_fake.width  = w;

        _obj.jqo_canvas.width  = w;
        _obj.jqo_canvas.height = Math.round( _obj.image_real_size.h*_ratio );

        _obj.jqo_area_list.forEach((_el)=>{

            _el.obj_mimagemap_coords = _el.obj_mimagemap_coords_or.split(',');

            let _area_coords     = _el.obj_mimagemap_coords,
                _area_coords_new = [];

            for( let x = 0; x < _area_coords.length; x++ )
            {
                _area_coords_new[x] = Math.round( _area_coords[x]*_ratio );
            }

            _el.coords               = _area_coords_new;
            _el.obj_mimagemap_coords = _area_coords_new;

            this._CalcShapeRect( _el );

        });

        image.obj_mimagemap.del_on_map_resize_after();

        this._UpdateView( _obj );

    } // Resize



    // set state for single area
    SetAreaState( area, state )
    {
        area.obj_mimagemap_state = state;

        this._UpdateView( area.obj_mimagemap );

    } // SetAreaState



    // set state for area list
    SetAreaStateList( obj, area_list, state )
    {
        let _obj      = obj,
            _selector = '';

        // build attr-based selector
        for( let x = 0; x < area_list.length; x++ )
        {
            _selector += '[' + this.options.ATTR_AREA_ID + '=\'' + area_list[x] + '\']';
            _selector += x == area_list.length-1 ? '' : ',';
        }
    
        let _area_filtered = Array.from( _obj.jqo_map.querySelectorAll( _selector ) );

        _area_filtered.forEach((_el)=>{
            _el.obj_mimagemap_state = state;
        });

        this._UpdateView( _obj );

    } // SetAreaStateList



    // set state for all areas in map
    SetMapState( obj, state )
    {
        obj.jqo_area_list.forEach( (_el)=>{ _el.obj_mimagemap_state = state; } );

        this._UpdateView( obj );

    } // SetMapState

} // MImageMap



// objects connector
// access obj_mimagemap
class MImageMapItem
{
    constructor()
    {
        this.jqo_image       = null; // <img />
        this.jqo_map         = null; // <map />
        this.jqo_area_list   = null; // <area /> list
        this.canvas          = null; // <canvas />
        this.jqo_canvas      = null; // $('canvas')
        this.canvas_context  = null; // canvas context or <canvas /> in IE
        this.jqo_image_fake  = null; // $('img') for background
        this.image_real_size = { w:0, h:0 };

        this.del_on_area_enter_before = function( area ){  };
        this.del_on_area_enter_after  = function( area ){  };
        this.del_on_area_leave_before = function( area ){  };
        this.del_on_area_leave_after  = function( area ){  };
        this.del_on_area_click_before = function( area ){  };
        this.del_on_area_click_after  = function( area ){  };
        this.del_on_map_enter_before  = function( area ){  };
        this.del_on_map_enter_after   = function( area ){  };
        this.del_on_map_leave_before  = function( area ){  };
        this.del_on_map_leave_after   = function( area ){  };
        this.del_on_map_resize_before = function( area ){  };
        this.del_on_map_resize_after  = function( area ){  };
    }

} // MImageMapItem
