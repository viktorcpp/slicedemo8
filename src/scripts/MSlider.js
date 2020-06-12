export default class MSlider
{
    constructor()
    {
        this.options                    = {};
        this.options.SEL_MAIN           = '.slider';
        this.options.SEL_CONTAINER      = '.slider__cont';
        this.options.SEL_VIEWPORT       = '.slider__viewport';
        this.options.SEL_VIEWPORT_ITEMS = 'li';

        this.options.SEL_PAGER        = '.slider__pager';
        this.options.CLS_PAGER_ACTIVE = 'active';

        this.options.SEL_DIR_PREV     = '.slider__direction-prev';
        this.options.SEL_DIR_NEXT     = '.slider__direction-next';
        this.options.CLS_DIR_DISABLED = 'slider__direction--disabled';

    } // constructor

    Init( new_options = null )
    {
        let _options = Object.assign( this.options, new_options || this.options );
        let _list    = Array.from( document.querySelectorAll( _options.SEL_MAIN ) );

        _list.forEach((_el)=>{

            let _loop                = Object.create(null);
                _loop.options        = _options;
                _loop.main           = _el;
                _loop.cont           = _el.querySelector( _options.SEL_CONTAINER );
                _loop.viewport       = _el.querySelector( _options.SEL_VIEWPORT );
                _loop.viewport_items = Array.from( _loop.viewport.querySelectorAll( _options.SEL_VIEWPORT_ITEMS ) );
                _loop.pager          = _el.querySelector( _options.SEL_PAGER );
                _loop.pager_items    = [];
                _loop.btn_prev       = _el.querySelector( _options.SEL_DIR_PREV );
                _loop.btn_next       = _el.querySelector( _options.SEL_DIR_NEXT );

                _loop.viewport.style['margin-left'] = '0';

                this._GenePager( _loop );
                this.UpdateLayout( _loop );

                window.MSliderOnResize = this._OnResize.call( this, _loop );
                window.addEventListener( 'resize', window.MSliderOnResize );

                _loop.viewport.MSliderOnSlideEnd = this._OnSlideEnd.call( this, _loop );
                _loop.viewport.addEventListener( 'transitionend', _loop.viewport.MSliderOnSlideEnd );

                _loop.btn_prev.MSliderOnBtnPrev = this._OnBtnPrev.call( this, _loop );
                _loop.btn_prev.addEventListener( 'click', _loop.btn_prev.MSliderOnBtnPrev );

                _loop.btn_next.MSliderOnBtnNext = this._OnBtnNext.call( this, _loop );
                _loop.btn_next.addEventListener( 'click', _loop.btn_next.MSliderOnBtnNext );

                _loop.pager_items.forEach((_li)=>{
                    _loop.pager.MSliderOnBtnPager = this._OnBtnPager.call( this, _loop );
                    _li.addEventListener( 'click', _loop.pager.MSliderOnBtnPager );
                });

        });

    } // Init

    UpdateLayout( _loop )
    {
        let _margin     = parseInt( _loop.viewport.style['margin-left'] );
        let _margin_max = -((_loop.viewport_items.length * _loop.cont.offsetWidth)-_loop.cont.offsetWidth);
        let _index_curr = Math.abs( _margin / _loop.cont.offsetWidth );

        _loop.viewport_items.forEach((_el)=>{
            _el.style['width'] = `${_loop.cont.offsetWidth}px`;
        });

        // update direction controls states
        if( _margin == 0 )
        {
            _loop.btn_prev.classList.add( this.options.CLS_DIR_DISABLED );
            _loop.btn_next.classList.remove( this.options.CLS_DIR_DISABLED );
        }
        else if( _margin <= _margin_max )
        {
            _loop.btn_prev.classList.remove( this.options.CLS_DIR_DISABLED );
            _loop.btn_next.classList.add( this.options.CLS_DIR_DISABLED );
        }
        else
        {
            _loop.btn_prev.classList.remove( this.options.CLS_DIR_DISABLED );
            _loop.btn_next.classList.remove( this.options.CLS_DIR_DISABLED );
        }

        // update pager
        _loop.pager_items.forEach((_el)=>{
            _el.classList.remove( _loop.options.CLS_PAGER_ACTIVE );
        });

        _loop.pager_items[_index_curr].classList.add( _loop.options.CLS_PAGER_ACTIVE );

    } // UpdateLayout

    _OnBtnPager( _loop )
    {
        return (e)=>
        {
            let _index = parseInt( e.currentTarget.attributes['data-index'].value );
            let _margin = _index * _loop.cont.offsetWidth;

            _loop.viewport.style['margin-left'] = `-${_margin}px`;
        }

    } // _OnBtnPager

    _OnBtnNext( _loop )
    {
        return (e)=>
        {
            if( e.currentTarget.classList.contains( _loop.options.CLS_DIR_DISABLED ) ) return;

            let _margin = parseInt( _loop.viewport.style['margin-left'] ) - _loop.cont.offsetWidth;

            _loop.viewport.style['margin-left'] = `${_margin}px`;
        }

    } // _OnBtnNext

    _OnBtnPrev( _loop )
    {
        return (e)=>
        {
            if( e.currentTarget.classList.contains( _loop.options.CLS_DIR_DISABLED ) ) return;

            let _margin = parseInt( _loop.viewport.style['margin-left'] ) + _loop.cont.offsetWidth;

            _loop.viewport.style['margin-left'] = `${_margin}px`;
        }

    } // _OnBtnPrev

    _OnSlideEnd( _loop )
    {
        return (e)=>
        {
            this.UpdateLayout( _loop );
        }

    } // _OnSlideEnd

    _GenePager( _loop )
    {
        let _html = '';

        for( let x = 0; x < _loop.viewport_items.length; x++ )
        {
            if( x == 0 )
                _html += `<li class="${_loop.options.CLS_PAGER_ACTIVE}" data-index="${x}"/>`;
            else
                _html += `<li data-index="${x}"/>`;

        } //

        _loop.pager.insertAdjacentHTML( 'afterbegin', _html );

        _loop.pager_items = Array.from( _loop.pager.querySelectorAll( 'li' ) );

    } // _GenePager

    _OnResize( _loop )
    {
        return (e)=>
        {
            this.UpdateLayout(_loop);
        }

    } // _OnResize

} // class MSlider
