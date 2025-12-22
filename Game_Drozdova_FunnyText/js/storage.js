const Storage = {
  KEY: "FunnyText_Rating",

  saveScore(name, score) {
    let ratings = this.getRatings();
    ratings.push({
      name: name,
      score: score,
      date: new Date().toLocaleTimeString(),
    });
    // Сортировка по убыванию баллов
    ratings.sort((a, b) => b.score - a.score);
    // Храним топ-10
    ratings = ratings.slice(0, 10);
    localStorage.setItem(this.KEY, JSON.stringify(ratings));
  },

  getRatings() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  },

  clearRatings() {
    localStorage.removeItem(this.KEY);
  },
};
