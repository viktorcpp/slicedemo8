export default class MOpener
{
    constructor()
    {
        this.options               = {};
        this.options.SEL_MAIN      = '.mopener';
        this.options.SEL_BTN       = '.mopener-btn';
        this.options.CLS_OPENED    = 'mopener--opened';
        this.options.CLS_PROCESSED = 'mopener--processed';

    } // constructor

    Init( new_options = null )
    {
        let _options = Object.assign( this.options, new_options || this.options );
        let _objects = Array.from( document.querySelectorAll( `${_options.SEL_MAIN}:not(.${_options.CLS_PROCESSED})` ) );

        _objects.forEach((_el)=>{

            let _loop         = Object.create(null);
                _loop.options = _options;
                _loop.main    = _el;
                _loop.btn     = _el.querySelector( _options.SEL_BTN );

            _loop.main.classList.add( _loop.options.CLS_PROCESSED );

            _loop.btn.MOpenerOnBtn = this._OnBtn.call( this, _loop );
            _loop.btn.addEventListener( 'click', _loop.btn.MOpenerOnBtn );

            _loop.main.MOpenerOnBody = this._OnBody.call( this, _loop );
            document.body.addEventListener( 'click', _loop.main.MOpenerOnBody, false );

            _loop.main.MOpenerOnMain = this._OnMain.call( this, _loop );
            _loop.main.addEventListener( 'click', _loop.main.MOpenerOnMain );

        });

    } // Init

    _OnMain( _loop )
    {
        return (e)=>
        {
            e.stopPropagation();
        }

    } // _OnMain

    _OnBody( _loop )
    {
        return (e)=>
        {
            _loop.main.classList.remove( _loop.options.CLS_OPENED );
        }

    } // _OnBody

    _OnBtn( _loop )
    {
        return (e)=>
        {
            e.preventDefault();
            e.stopPropagation();

            _loop.main.classList.toggle( _loop.options.CLS_OPENED );
        }

    } // _OnBtn

} // class MOpener
