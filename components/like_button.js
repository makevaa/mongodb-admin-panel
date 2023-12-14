console.log('like-button.js');

function Profile() {
  return React.createElement("img", {
    src: "https://i.imgur.com/MK3eW3As.jpg",
    alt: "Katherine Johnson"
  });
}

export default function Gallery() {
  return React.createElement(
    "section",
    null,
    React.createElement(
      "h1",
      null,
      "Amazing scientists"
    ),
    React.createElement(Profile, null),
    React.createElement(Profile, null),
    React.createElement(Profile, null)
  );
}