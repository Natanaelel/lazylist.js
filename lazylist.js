class Lazylist {
    constructor(func, get_size, size = Infinity){
        this.func = func // func = (this, index) => element
        this.get_size = get_size || (() => this.to_array().length)
        this.list = []
        this.size = size
    }
    at(index){
        if(index >= this.get_size()) throw new RangeError("index too large")
        if(index < 0) throw new RangeError("index too small")
        
        if(index in this.list){
            return this.list[index]
        }
        else{
            this.list[index] = this.func(this, index)
            return(this.list[index])
        }
    }
    map(mapping_func){
        const get_at = (self, index) => mapping_func(this.at(index))
        return new Lazylist(get_at, this.get_size)
    }
    filter(predicate){
        let filtered = []
        let last_index = 0
        const get_at = (self, index) => {
            for(let _i = filtered.length; _i <= index; _i++){
                while(!predicate(this.at(last_index))){
                    last_index += 1
                }
                filtered.push(this.at(last_index))
                last_index += 1
                }
            return filtered[index]
        }
        return new Lazylist(get_at, this.get_size)
    }
    head(){
        return this.at(0)
    }
    tail(){
        const get_at = (self, index) => this.at(index + 1)
        return new Lazylist(get_at, () => this.get_size() - 1)
    }
    init(){
        const get_at = (self, index) => this.at(index)
        return new Lazylist(get_at, () => this.get_size() - 1)
    }
    take(num){
        const get_at = (self, index) => this.at(index)
        return new Lazylist(get_at, () => Math.min(num, this.get_size()))
    }
    take_while(predicate){ // recurively defined
        const get_at = (self, index) => {    
            if(predicate(this.at(index))){
                if(index == 0) return this.at(index) // base case here
                if(predicate(this.at(index - 1))) return this.at(index) // recursion here
                throw new RangeError("index too large")
            }
            throw new RangeError("index too large")
        }
        return new Lazylist(get_at, this.get_size)
    }
    drop(num){
        const get_at = (self, index) => this.at(index + num)
        return new Lazylist(get_at, () => this.get_size() - num)
    }
    call(func){
        let result = null
        const get_at = (self, index) => {
            if(result !== null){
                return result.at(index)
            }
            result = func(this)
            return result.at(index)
        }
        return new Lazylist(get_at, this.get_size)
    }
    concat(other){
        const get_at = (self, index) => {
            try{
                return this.at(index)
            }
            catch(e){
                if(!(e instanceof RangeError)) throw e
                return other.at(index - this.get_size())
            }
        }
        return new Lazylist(get_at, () => this.get_size() + other.get_size())
    }
    to_array(){
        let arr = []
        this.size = this.get_size()
        for(let i = 0; i < this.size; i++){
            try{
                arr.push(this.at(i))
            }catch(e){
                if(!(e instanceof RangeError)) throw e
                this.size = i
                this.get_size = () => this.size
                return arr
            }
        }
        return arr
        // return Array(this.get_size()).fill().map((_, i) => this.at(i))
    }
    static repeat(element){
        return new Lazylist(() => element, () => Infinity)
    }
    static cycle(list){
        const get_at = (self, index) => {
            return list.at(index % list.length)
        }
        return new Lazylist(get_at, () => Infinity)
    }
    static from(arr){
        const get_at = (self, index) => {
            return arr[index]
        }
        return new Lazylist(get_at, () => arr.length)
    }
    static iterate(func, start_val){
        const get_at = (self, index) => {
            if(index == 0) return start_val
            return func(self.at(index - 1))
        }
        return new Lazylist(get_at, () => Infinity)
    }
    static naturals = new Lazylist((_, i) => i + 1, () => Infinity)
    static reals = new Lazylist((_, i) => 0 + (((i & 1) << 1) -1) * ((i + 1) >> 1), () => Infinity)
}

module.exports = {Lazylist}
