// list.js

var Item = function Item() {
    return React.createElement(
        "div",
        { "class": "item" },
        "list item"
    );
};

var List = function List() {
    return React.createElement(
        "div",
        null,
        React.createElement(Item, null),
        React.createElement(Item, null),
        React.createElement(Item, null)
    );
};

export { List };