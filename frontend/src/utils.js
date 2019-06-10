let uri;

if (process.env.NODE_ENV === "production") {
  uri = "http://34.214.190.158";
} else {
  uri = "http://127.0.0.1:4000";
}

export let CURRENT_URI = uri;
