const _ = require("lodash");
const moment = require("moment");
const Alarms = require("../../../lib/models").alarms;
const TableSchema = require("../../services");

class AlarmController {
  getAlarm = async (req, res) => {
    try {
      let alarm = await TableSchema.getAll({},Alarms);

      return res.success(alarm, req.__("GET_ALARM"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
  addAlarm = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      const { description, time, date, timezone } = params;
      const createPayload = {
        description: description,
        time: time,
        date: date,
        timezone: timezone,
        datetimeUTC: moment(date + " " + time)
          .utc()
          .format("YYYY-MM-DD HH:mm"),
        status: 1,
      };
      let alarm = await TableSchema.create(createPayload,Alarms);
      if (alarm) {
        return res.success(alarm, req.__("CREATE_ALARM"));
      } else {
        return res.warn({}, req.__("CREATE_ALARM_ERROR"));
      }
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
  updateAlarm = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      const { id, description, time, date, timezone } = params;
      let alarm = await TableSchema.get({ where: { id: id } },Alarms);
      if (!alarm) {
        return res.warn({}, req.__("ALARM_NOT_FOUND"));
      }
      const updatePayload = {
        description: description,
        time: time,
        date: date,
        timezone: timezone,
        datetimeUTC: moment(date + " " + time)
          .utc()
          .format("YYYY-MM-DD HH:mm"),
        status: 1,
      };
      let alarmUpdate = await TableSchema.update(updatePayload, {
        where: { id: id },
      },Alarms);
      if (alarmUpdate) {
        return res.success({}, req.__("UPDATE_ALARM"));
      } else {
        return res.warn({}, req.__("UPDATE_ALARM_ERROR"));
      }
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
  updateStatusAlarm = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      const { id, status } = params;
      let alarm = await TableSchema.get({ where: { id: id } },Alarms);
      if (!alarm) {
        return res.warn({}, req.__("ALARM_NOT_FOUND"));
      }
      const updatePayload = {
        status: status,
      };
      let alarmUpdate = await TableSchema.update(updatePayload, {
        where: { id: id },
      },Alarms);
      if (alarmUpdate) {
        return res.success({}, req.__("UPDATE_ALARM"));
      } else {
        return res.warn({}, req.__("UPDATE_ALARM_ERROR"));
      }
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
  deleteAlarm = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      const { id } = params;
      let alarm = await TableSchema.get({ where: { id: id } },Alarms);
      if (!alarm) {
        return res.warn({}, req.__("ALARM_NOT_FOUND"));
      }
      await TableSchema.delete({ where: { id: id } },Alarms);
      return res.success({}, req.__("DELETE_ALARM"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
}

module.exports = new AlarmController();
