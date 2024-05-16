class FilterDataStrategy{
    execute(){
        throw Error("Not implemented")
    }
}

class AllFilters extends FilterDataStrategy{

}

class NoFilters extends FilterDataStrategy{

}

class TextFilterAndOneCompomentFilter extends FilterDataStrategy{

}

class TextFilterOnly extends FilterDataStrategy{

}

class ComponentFiltersOnly