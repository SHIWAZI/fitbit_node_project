const _ = require("lodash");
const Notifications = require("../../../lib/models").notifications;
const TableSchema = require("../../services");

class NotificationsController {
  getNotifications = async (req, res) => {
    try {
      const notifyCondition = {
        attributes: Notifications.selectFields(),
        where: { to_id: req.user.id, user_type: "0" },
        order: [["createdAt", "DESC"]],
      };

      let NotificationData = await TableSchema.getAll(
        notifyCondition,
        Notifications
      );
      return res.success(NotificationData, req.__("GET_NOTIFICATION"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
  deleteNotifications = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let notifyCondition;
      let message;
      if (params.notification_id) {
        let notification = await TableSchema.get(
          { where: { id: params.notification_id } },
          Notifications
        );
        if (!notification) {
          return res.warn({}, req.__("NOTIFICATION_NOT_FOUND"));
        }
        notifyCondition = {
          where: {
            id: params.notification_id,
            to_id: req.user.id,
            user_type: "0",
          },
        };
        message = req.__("DELETE_NOTIFICATION");
      } else {
        notifyCondition = { where: { to_id: req.user.id, user_type: "0" } };
        message = req.__("DELETE_ALL_NOTIFICATION");
      }
      await TableSchema.delete({ notifyCondition }, Notifications);
      return res.success({}, message);
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
  readStatusNotifications = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let notifyCondition;
      let message;
      if (params.notification_id) {
        let notification = await TableSchema.get(
          { where: { id: params.notification_id } },
          Notifications
        );
        if (!notification) {
          return res.warn({}, req.__("NOTIFICATION_NOT_FOUND"));
        }
        notifyCondition = {
          where: {
            id: params.notification_id,
            to_id: req.user.id,
            user_type: "0",
          },
        };
        message = req.__("READ_NOTIFICATION");
      } else {
        notifyCondition = { where: { to_id: req.user.id, user_type: "0" } };
        message = req.__("READ_ALL_NOTIFICATION");
      }
      let notifyUpdate = {
        is_read: true,
      };

      console.log(notifyUpdate);

      let update = await TableSchema.update(
        notifyUpdate,
        notifyCondition,
        Notifications
      );
      if (update) {
        return res.success({}, message);
      } else {
        return res.warn({}, req.__("READ_NOTIFICATION_ERROR"));
      }
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
}

module.exports = new NotificationsController();
