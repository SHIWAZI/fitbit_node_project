const _ = require("lodash");
const moment = require("moment");
const db = require("../../../lib/models");
const UserActivities = require("../../../lib/models").user_activities;
const UserActivityStreaks =
  require("../../../lib/models").user_activity_streaks;

const UserActivityProgress = require("../../../lib/models").activity_progress;

const TableSchema = require("../../services");

const sequelize = require("sequelize");
const Op = db.Sequelize.Op;
const {
  getAllDateWiseActivity,
  getWellnessScore,
  getWellnessScoreArray,
} = require("../../utils/common.js");
class DashboardController {
  get = async (req, res) => {
    try {
      const resData = {};
      let filterDate = moment().tz("Asia/Calcutta").format("yyyy-MM-DD");
      //let previousDate = moment().subtract(1, 'days').tz("Asia/Calcutta").format("yyyy-MM-DD");

      let filter = {
        where: {
          userId: req.user.id,
          status: "1",
          dateTime: {
            [Op.and]: {
              [Op.gte]: filterDate + " 00:00",
              [Op.lte]: filterDate + " 23:59",
            },
          },
        },
      };
      console.log("Complete", filter);
      let userStreaksCount = await TableSchema.count(
        filter,
        UserActivityProgress
      );
      console.log(userStreaksCount);
      resData["yourGoal"] = {
        daily_wellness_goal: req.user.daily_wellness_goal,
        today_completed_activity: userStreaksCount,
      };
      let activitiesFilter = { where: { status: 1, userId: req.user.id } };
      let weekDay = moment(filterDate).format("ddd");
      let activities = await TableSchema.getAll(
        activitiesFilter,
        UserActivities
      );

      if (activities.length) {
        const { ongoing, skipped, complete } = await getAllDateWiseActivity(
          activities,
          filterDate,
          weekDay
        );
        resData["ongoing"] = ongoing;
        resData["skipped"] = skipped;
        resData["complete"] = complete;
      }
      const { scoreData, userDays } = await getWellnessScore(req.user);
      if (userDays > 0) {
        resData["total_days"] = userDays;
      } else {
        resData["total_days"] = 1;
      }
      const { current_score } = await getWellnessScoreArray(
        req.user,
        req.user.previous_wellness_score + scoreData
      );
      resData["current_level"] = current_score;
      resData["onboarding_step"] = req.user.onboarding_step ?? "0";
      resData["wellness_score"] = req.user.previous_wellness_score + scoreData;

      return res.success(resData, req.__("GET_DASHBOARD"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
}

module.exports = new DashboardController();
