let Sequelize = require("sequelize");
const _ = require("lodash");
const Quotes = require("../../../lib/models").quotes;
const UserQuotes = require("../../../lib/models").user_quotes;
const TableSchema = require("../../services");

class QuoteController {
  getQuote = async (req, res) => {
    try {
      let quotes = await TableSchema.getAll(
        {
          attributes: Quotes.selectFields(),
          order: Sequelize.literal("rand()"),
          limit: 1,
        },
        Quotes
      );
      if (quotes.length) {
        return res.success(quotes[0], req.__("GET_QUOTES"));
      } else {
        return res.warn({}, req.__("QUOTES_NOT_FOUND"));
      }
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };

  getUserQuote = async (req, res) => {
    try {
      let quotes = await TableSchema.getAll(
        {
          where: {
            userId: req.user.id,
          },
          include: {
            model: Quotes,
            attributes: ["author_name", "description"],
          },
        },
        UserQuotes
      );
      if (quotes.length) {
        return res.success(quotes, req.__("GET_USER_QUOTES"));
      } else {
        return res.warn([], req.__("QUOTES_NOT_FOUND"));
      }
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };

  addUserQuotes = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let { quoteId } = params;

      let createPayload = {
        quoteId: quoteId,
        userId: req.user.id,
      };

      let createData = await TableSchema.create(createPayload, UserQuotes);
      if (createData) {
        return res.success(createData, req.__("CREATE_USER_QUOTES"));
      } else {
        return res.warn({}, req.__("CREATE_USER_QUOTES_ERROR"));
      }
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };

  deleteUserQuotes = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      const { id } = params;
      let userQuoteData = await TableSchema.get(
        { where: { id: id, userId: req.user.id } },
        UserQuotes
      );
      if (!userQuoteData) {
        return res.warn({}, req.__("QUOTES_NOT_FOUND"));
      }
      await TableSchema.delete({ where: { id: id } }, UserQuotes);

      return res.success({}, req.__("DELETE_USER_QUOTES"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
}

module.exports = new QuoteController();
