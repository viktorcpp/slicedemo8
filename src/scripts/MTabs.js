
export default class MTabs
{
    constructor()
    {
        this.options              = {};
        this.options.sel_tab      = "data-mtabs";
        this.options.sel_page     = "data-mpage";
        this.options.sel_tab_page = "data-mtabs-page";
        this.options.cls_active   = "active";
        this.options.processed    = "data-mtabs-processed";

    } // constructor



    // @public
    SelectTab( sel )
    {
        let _tab = document.querySelector(sel);
        if( !_tab ) return;
        window.mtabs._ProcessEl(_tab);

    } // SelectTab



    // @public
    Init( new_options = null )
    {
        let _options   = Object.assign( this.options, this.options || new_options );
        let _all_tabs  = [];
        let _loop_coll = [];

        _all_tabs = Array.from( document.querySelectorAll( "["+_options.sel_tab+"]:not(["+_options.processed+"])" ) );
        _all_tabs.forEach((_el)=>
        {
            let _tab_grp = _el.attributes[_options.sel_tab].value;
            if( !_loop_coll.includes(_tab_grp) )
            {
                _loop_coll.push(_tab_grp);
                _loop_coll[_tab_grp]       = {};
                _loop_coll[_tab_grp].tabs  = [];
                _loop_coll[_tab_grp].pages = [];
            }
            if( !_loop_coll[_tab_grp].tabs.includes(_el) )
            {
                _loop_coll[_tab_grp].tabs.push(_el);
            }

            let _page = document.querySelector("["+_options.sel_page+"='"+_el.attributes[_options.sel_tab_page].value+"']");
            if( !_loop_coll[_tab_grp].pages.includes(_page) && !!_page )
            {
                _loop_coll[_tab_grp].pages.push(_page);
            }

            _el._loop         = _loop_coll[_tab_grp];
            _el._loop.options = _options;
            _el._loop_page    = _page;
            _page._loop       = _loop_coll[_tab_grp];
            _page._loop_tab   = _el;

            _el.addEventListener( "click", this._OnTab(_el) );

            _el.setAttribute(_options.processed, "");
        
        });

    } // Init



    // @private
    _OnTab(_el)
    {
        return function(e)
        {
            e.preventDefault();

            window.mtabs._ProcessEl(_el);
        }
    
    } // _OnTab



    _ProcessEl(_el)
    {
        window.mtabs._ClearActive(_el._loop.tabs);
        window.mtabs._ClearActive(_el._loop.pages);

        _el.classList.add(_el._loop.options.cls_active);
        _el._loop_page.classList.add(_el._loop.options.cls_active);

    } // _ProcessEl



    _ClearActive( list )
    {
        list.forEach((_el)=>
        {
            _el.classList.remove(_el._loop.options.cls_active);
        });

    } // _ClearActive

} // class MTabs
