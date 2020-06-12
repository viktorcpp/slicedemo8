
'use strict';

import "core-js";
//import "regenerator-runtime/runtime";

import MTabs       from './MTabs.js';
import MImageMap   from './MImageMap';
import MSearchForm from './MSearchForm';
import MSlider     from './MSlider';
import MOpener     from './MOpener';

function Main(e)
{
    window.mtabs       = new MTabs();
    window.mimagemap   = new MImageMap();
    window.msearchform = new MSearchForm();
    window.mslider     = new MSlider();
    window.mopener     = new MOpener();

} // Main


function OnLoaded(e)
{
    window.mtabs.Init();
    window.mimagemap.Skin( '.habiter__map img' );
    window.msearchform.Init();
    window.mslider.Init();

    let _mopener_args            = {};
        _mopener_args.SEL_MAIN   = '.menu-personal';
        _mopener_args.SEL_BTN    = '.menu-personal__btn';
        _mopener_args.CLS_OPENED = 'menu-personal__main--opened';
    window.mopener.Init( _mopener_args );

} // OnLoaded


function OnResize(e)
{
    //

} // OnResize


window.addEventListener( "DOMContentLoaded", Main );
window.addEventListener( "load",             OnLoaded );
window.addEventListener( "resize",           ()=>{ OnResize(); } );
