// list.js

const Item = () => {
    return (
        <div class="item">
            list item
        </div>
    );
}


const List = () => {
    return (
        <div>
            <Item />
            <Item />
            <Item />
        </div>
    ); 
}

export {List}

