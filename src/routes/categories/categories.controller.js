const Categories = require("../../../lib/models").categories;
const Activities = require("../../../lib/models").activities;

const TableSchema = require("../../services");

class CategoriesController {
  getCategory = async (req, res) => {
    try {
      let categories = await TableSchema.getAll(
        {
          attributes: Categories.selectFields(),
          where: { status: 1 },
          include: [{ model: Activities, as: "activities" }],
        },
        Categories
      );
      return res.success(categories, req.__("GET_CATEGORY"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
}

module.exports = new CategoriesController();
