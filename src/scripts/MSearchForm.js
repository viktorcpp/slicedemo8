export default class MSearchForm
{
    constructor()
    {
        this.options               = {};
        this.options.SEL_MAIN      = '.habiter__form';
        this.options.SEL_MARKER    = '.habiter__marker';
        this.options.SEL_OBJECTS   = 'input:not([type=submit]),select';
        this.options.CLS_PROCESSED = 'MSearchForm-processed';

    } // constructor

    Init( new_options = null )
    {
        let _loop         = Object.create(null);
            _loop.options = Object.assign( this.options, new_options || this.options );
            _loop.main    = document.querySelector( `${_loop.options.SEL_MAIN}:not(.${_loop.options.CLS_PROCESSED})` );
        if( !_loop.main ) return;

        _loop.main.classList.add( _loop.options.CLS_PROCESSED );
        _loop.inputs = Array.from( _loop.main.querySelectorAll( _loop.options.SEL_OBJECTS ) );
        _loop.marker = _loop.main.querySelector( _loop.options.SEL_MARKER );

        _loop.inputs.forEach((_el)=>{
            _el.addEventListener( 'focus', this._OnFocus.call( this, _loop ) );
            _el.addEventListener( 'blur',  this._OnBlur.call( this, _loop ) );
        });

    } // Init

    _OnFocus( _loop )
    {
        return (e)=>
        {
            let _offset = this._Offset( _loop, e.currentTarget );
            _loop.marker.style['top']     = `${_offset}px`;
            _loop.marker.style['opacity'] = 1;
        }

    } // _OnFocus

    _OnBlur( _loop )
    {
        return (e)=>
        {
            _loop.marker.style['opacity'] = 0;
        }

    } // _OnBlur

    _Offset( _loop, _curr )
    {
        let _rect_main = _loop.main.getBoundingClientRect();
        let _rect_curr = _curr.getBoundingClientRect();

        return _rect_curr.top - _rect_main.top + ( (_curr.offsetHeight - _loop.marker.offsetHeight) / 2 );

    } // _Offset

} // class MSearchForm
