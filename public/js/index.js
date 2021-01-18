const app = new Vue({
  el: "#app",
  data: {
    message: "",
    error: "",
    error_code: "",
    url: "",
    slug: "",
    prev_shorten: [],
    seen: false,
  },
  methods: {
    shorten: async function () {
      try {
        const response = await fetch("/api/shorten", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: this.url, slug: this.slug }),
        });
        if (!response.ok) {
          this.error = response.statusText;
          this.error_code = response.status;
          this.seen = false;
          response.text().then((result) => {
            this.message = result;
          });
        } else {
          response.json().then((result) => {
            // Clearing errors
            this.error = "";
            this.eror_code = "";
            // Clearing inputs
            this.url = "";
            this.slug = "";
            // Saving result
            this.seen = true;
            this.prev_shorten = [result["_id"], result["url"], result["slug"]];
            this.message = result["slug"];
          });
        }
      } catch (error) {
        this.message = error.message;
      }
    },
    dismiss_notification: function () {
      this.seen = false;
      this.error = "";
    },
  },
});
