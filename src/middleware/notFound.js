module.exports = (req, res) => {
  res.status(404).render("pages/404", {
    title: "Page Not Found",
  });
};
