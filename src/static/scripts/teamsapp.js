(() => {
  "use strict";

  // Call the initialize API first
  microsoftTeams.app.initialize().then(() => {
    microsoftTeams.authentication
      .getAuthToken()
      .then((token) => {
        // Do something with the token.
        console.log(token);
        fetch("https://6f2b-126-19-120-213.ngrok-free.app/getProfile", {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            token: token,
          }),
        })
          .then((response) => {
            console.log(response);
            response
              .json()
              .then((data) => {
                document.getElementById("displayName").innerText =
                  data.displayName + "'s";
              })
              .catch((e) => {
                console.error(e);
              });
          })
          .catch((e) => {
            console.error(e);
          });
      })
      .catch((e) => {
        console.error(e);
      });
  });
})();
