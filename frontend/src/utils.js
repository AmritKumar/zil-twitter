let uri;

if (process.env.NODE_ENV === "production") {
  uri = "http://52.35.128.69";
} else {
  uri = "http://127.0.0.1:4000";
}

export let CURRENT_URI = uri;
