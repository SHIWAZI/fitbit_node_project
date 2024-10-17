const _ = require("lodash");
const moment = require("moment");
const db = require("../../../lib/models");
const UserActivities = require("../../../lib/models").user_activities;
const UserActivityProgress = require("../../../lib/models").activity_progress;
const UserActivityStreaks =
  require("../../../lib/models").user_activity_streaks;
const Activities = require("../../../lib/models").activities;
const Notifications = require("../../../lib/models").notifications;
const Users = require("../../../lib/models").users;
const RewardWinners = require("../../../lib/models").reward_winners;

const TableSchema = require("../../services");
const {
  getArrayDate,
  currentAndHighestStreaks,
  getAllDateWiseActivity,
  getWellnessScore,
  getWellnessScoreArray,
  winnerNotification,
} = require("../../utils/common.js");
const sequelize = require("sequelize");
const Op = db.Sequelize.Op;
class ActivitiesController {
  getActivities = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      const { categoryId } = params;
      let filter = {};
      if (categoryId) {
        filter = { where: { categoryId: categoryId } };
      }
      let activities = await TableSchema.getAll(filter, Activities);
      let resArray = [];
      if (activities.length) {
        for (let index = 0; index < activities.length; index++) {
          const act = activities[index];
          const activityCount = await TableSchema.count(
            { where: { activityId: act.id } },
            UserActivities
          );

          resArray.push({
            id: act.id,
            name: act.name,
            description: act.description,
            categoryId: act.categoryId,
            status: act.status,
            userCount: activityCount,
          });
        }
      }
      return res.success(resArray, req.__("GET_ACTIVITY"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
  getUserActivities = async (req, res) => {
    try {
      const reqData = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let filter = { where: { status: 1, userId: req.user.id } };
      if (reqData?.activityId) {
        filter = {
          where: { activitiesId: reqData.activityId, userId: req.user.id },
        };
      }
      let filterDate = moment().tz("Asia/Calcutta").format("yyyy-MM-DD");
      if (reqData?.date) {
        filterDate = moment(reqData.date).format("yyyy-MM-DD");
      }
      let weekDay = moment(filterDate).format("ddd");

      let activities = await TableSchema.getAll(filter, UserActivities);
      let notificationCount = await TableSchema.count(
        { where: { to_id: req.user.id } },
        Notifications
      );
      const resData = {};
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
      resData["notificationCount"] = notificationCount;
      return res.success(resData, req.__("GET_ACTIVITY"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
  addActivities = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let {
        name,
        activitiesId,
        description,
        time,
        date,
        timezone,
        weeks_slug,
        weekdays,
        reminder,
        repeat,
        schedule,
      } = params;
      if (name === "" && description === "" && activitiesId === "") {
        return res.warn({}, "Name or Activity Id Required.");
      }
      let weeks = "";

      if (weeks_slug === "everyday") {
        weeks = "Mon,Tue,Wed,Thu,Fri,Sat,Sun";
      } else if (weeks_slug === "every_other_day") {
        weeks = "";
      } else if (weeks_slug === "only_weekdays") {
        weeks = "Mon,Tue,Wed,Thu,Fri";
      } else if (weeks_slug === "only_weekends") {
        weeks = "Sat,Sun";
      } else if (weeks_slug === "custom_days") {
        weeks = weekdays;
      }

      if (activitiesId) {
        const activityData = await TableSchema.get(
          { where: { id: activitiesId } },
          Activities
        );
        name = activityData.name;
        description = activityData.description;
      }
      let createPayload = {
        name: name,
        userId: req.user.id,
        activityId: activitiesId,
        description: description,
        time: time,
        date: date,
        timezone: timezone,
        datetimeUTC: moment().utc().format("YYYY-MM-DD HH:mm"),
        status: 1,
        weekdays: weeks,
        weeks_slug: weeks_slug,
        reminder: reminder,
        repeat_count: repeat,
        schedule: schedule,
        endDate: date,
      };
      if (reminder) {
        createPayload["reminder_status"] = 1;
      }
      if (repeat) {
        createPayload["repeat_status"] = 1;
        if (repeat === "end") {
          createPayload["endDate"] = null;
          if (weeks.length === 0) {
            createPayload["weekdays"] =
              weeks_slug === "every_other_day"
                ? ""
                : "Mon,Tue,Wed,Thu,Fri,Sat,Sun";
          }
        } else {
          createPayload["endDate"] = moment(date)
            .add(repeat, "days")
            .format("YYYY-MM-DD");
        }
      }
      let userActivities = await TableSchema.create(
        createPayload,
        UserActivities
      );
      let dateArr = [];
      if (userActivities) {
        if (weeks_slug !== "every_other_day" && repeat !== "end") {
          const repeatCount = repeat != "" ? repeat - 1 : 0;
          dateArr = getArrayDate(
            date + " " + time,
            weeks,
            repeatCount,
            reminder,
            weeks_slug
          );
        } else if (weeks_slug === "every_other_day" && repeat !== "end") {
          const repeatCount = repeat != "" ? repeat - 1 : 0;
          dateArr = getArrayDate(
            date + " " + time,
            weeks,
            repeatCount,
            reminder,
            weeks_slug
          );
        }
        if (dateArr.length) {
          for (let index = 0; index < dateArr.length; index++) {
            const element = dateArr[index];
            await TableSchema.create(
              {
                name: name,
                description: description,
                userActivityId: userActivities.id,
                userId: req.user.id,
                dateTime: element.date,
                send_date_time: element.reminderDateTime,
                weeks: element.days,
                send_notify: "0",
                status: "0",
              },
              UserActivityProgress
            );
          }
        }
        return res.success(userActivities, req.__("CREATE_ACTIVITY"));
      } else {
        return res.warn({}, req.__("CREATE_ACTIVITY_ERROR"));
      }
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
  updateActivities = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let {
        id,
        name,
        activitiesId,
        description,
        time,
        date,
        timezone,
        weeks_slug,
        weekdays,
        reminder,
        repeat,
        schedule,
      } = params;
      if (name === "" && description === "" && activitiesId === "") {
        return res.warn({}, "Name or Activity Id Required.");
      }
      let weeks = "";
      if (weeks_slug === "everyday") {
        weeks = "Mon,Tue,Wed,Thu,Fri,Sat,Sun";
      } else if (weeks_slug === "every_other_day") {
        weeks = "";
      } else if (weeks_slug === "only_weekdays") {
        weeks = "Mon,Tue,Wed,Thu,Fri";
      } else if (weeks_slug === "only_weekends") {
        weeks = "Sat,Sun";
      } else if (weeks_slug === "custom_days") {
        weeks = weekdays;
      }
      if (activitiesId) {
        const activityData = await TableSchema.get(
          { where: { id: activitiesId } },
          Activities
        );
        name = activityData.name;
        description = activityData.description;
      }
      if (name) {
        name = name;
      }
      if (description) {
        description = description;
      }

      let updatePayload = {
        name: name,
        userId: req.user.id,
        activityId: activitiesId,
        description: description,
        time: time,
        date: date,
        timezone: timezone,
        datetimeUTC: moment(date + " " + time || "00:00")
          .utc()
          .format("YYYY-MM-DD HH:mm"),
        status: 1,
        weekdays: weeks,
        weeks_slug: weeks_slug,
        reminder: reminder,
        repeat_count: repeat,
        schedule: schedule,
        endDate: date,
      };
      if (reminder) {
        updatePayload["reminder_status"] = 1;
      }
      if (repeat) {
        if (repeat === "end") {
          updatePayload["endDate"] = null;
          if (weeks.length === 0) {
            updatePayload["weekdays"] =
              weeks_slug === "every_other_day"
                ? ""
                : "Mon,Tue,Wed,Thu,Fri,Sat,Sun";
          }
        } else {
          updatePayload["endDate"] = moment(date)
            .add(repeat, "days")
            .format("YYYY-MM-DD");
        }
        updatePayload["repeat_status"] = 1;
      } else {
        updatePayload["repeat_status"] = 0;
      }
      const currentDateTime = moment(date + " " + "00:00").format(
        "yyyy-MM-DD HH:mm"
      );
      let activities = await TableSchema.get(
        { where: { id: id } },
        UserActivities
      );
      if (!activities) {
        return res.warn({}, req.__("ACTIVITY_NOT_FOUND"));
      } else {
        if (
          moment(date).format("yyyy-MM-DD") == activities.date ||
          (activities.endDate &&
            moment().tz("Asia/Calcutta").format("yyyy-MM-DD") ==
              activities.endDate)
        ) {
          await TableSchema.delete(
            {
              where: {
                userActivityId: id,
              },
            },
            UserActivityProgress
          );

          await TableSchema.delete(
            {
              where: {
                id: id,
              },
            },
            UserActivities
          );
        } else {
          let count = await TableSchema.count(
            {
              where: {
                userActivityId: id,
                dateTime: { [sequelize.Op.lte]: currentDateTime },
              },
            },
            UserActivityProgress
          );
          if (count) {
            await TableSchema.update(
              {
                repeat_count: count,
                endDate: moment(date).tz("Asia/Calcutta").format("YYYY-MM-DD"),
              },
              {
                where: { id: id },
              },
              UserActivities
            );

            await TableSchema.delete(
              {
                where: {
                  userActivityId: id,
                  dateTime: { [sequelize.Op.gte]: currentDateTime },
                },
              },
              UserActivityProgress
            );
          }
        }
      }
      let activitiesCreate = await TableSchema.create(
        updatePayload,
        UserActivities
      );
      let dateArr = [];
      if (activitiesCreate) {
        if (weeks_slug !== "every_other_day" && repeat !== "end") {
          const repeatCount = repeat != "" ? repeat - 1 : 0;
          dateArr = getArrayDate(
            date + " " + time,
            weeks,
            repeatCount,
            reminder,
            weeks_slug
          );
        } else if (weeks_slug === "every_other_day" && repeat !== "end") {
          const repeatCount = repeat != "" ? repeat - 1 : 0;
          dateArr = getArrayDate(
            date + " " + time,
            weeks,
            repeatCount,
            reminder,
            weeks_slug
          );
        }
        if (dateArr.length) {
          console.log(dateArr);
          for (let index = 0; index < dateArr.length; index++) {
            const element = dateArr[index];
            await TableSchema.create(
              {
                name: name,
                description: description,
                userActivityId: activitiesCreate.id,
                userId: req.user.id,
                dateTime: element.date,
                send_date_time: element.reminderDateTime,
                weeks: element.days,
                send_notify: "0",
                status: "0",
              },
              UserActivityProgress
            );
          }
        }
        return res.success({}, req.__("UPDATE_ACTIVITY"));
      } else {
        return res.warn({}, req.__("UPDATE_ACTIVITY_ERROR"));
      }
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
  updateStatusActivities = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      const { id, userActivitiesId, status, date } = params;
      let activities = await TableSchema.get(
        { where: { id: userActivitiesId, userId: req.user.id } },
        UserActivities
      );
      if (!activities) {
        return res.warn({}, req.__("ACTIVITY_NOT_FOUND"));
      }
      const score = await getWellnessScore(req.user);
      const previousScore = score.scoreData + req.user.previous_wellness_score;
      const levelScore = await getWellnessScoreArray(req.user, previousScore);
      const pastLevel = levelScore.current_score;
      const updatePayload = {
        status: status,
      };
      let activitiesUpdate = null;
      if (id == "" && date) {
        if (status == 1 || status == 2) {
          let getDate = moment(date).format("yyyy-MM-DD");
          const weekDay = moment(getDate).format("ddd");

          const dateTime =
            activities?.time && activities?.time !== ""
              ? getDate + " " + activities.time
              : getDate + " " + "00:00";
          console.log("dateTime", dateTime);
          let reminderDateTime = dateTime;
          const getUserActivityProgress = await TableSchema.get(
            {
              where: {
                userActivityId: userActivitiesId,
                status: status,
                dateTime: dateTime,
              },
            },
            UserActivityProgress
          );
          activitiesUpdate = getUserActivityProgress;
          if (!getUserActivityProgress) {
            if (activities.reminder != "") {
              reminderDateTime = moment(dateTime, "YYYY-MM-DD HH:mm")
                .subtract(activities.reminder, "minutes")
                .format("YYYY-MM-DD HH:mm");
            }

            console.log("dateTime", dateTime);
            activitiesUpdate = await TableSchema.create(
              {
                userActivityId: userActivitiesId,
                name: activities.name,
                description: activities.description,
                userId: req.user.id,
                dateTime: dateTime,
                send_date_time: reminderDateTime,
                weeks: weekDay,
                send_notify: "0",
                status: status,
              },
              UserActivityProgress
            );
          }
        }
      } else {
        activitiesUpdate = await TableSchema.update(
          updatePayload,
          {
            where: { id: id, userActivityId: userActivitiesId },
          },
          UserActivityProgress
        );
      }
      let getDate = date
        ? moment(date).format("yyyy-MM-DD")
        : moment().tz("Asia/Calcutta").format("yyyy-MM-DD");

      let is_today_wellness_goal_complete = false;
      if (status == 1) {
        console.log(
          req.body,
          getDate,
          moment().tz("Asia/Calcutta").format("yyyy-MM-DD")
        );
        if (getDate === moment().tz("Asia/Calcutta").format("yyyy-MM-DD")) {
          const sumStreaks = await TableSchema.sum(
            "completeActivity",
            {
              where: {
                userId: req.user.id,
                [Op.and]: [
                  sequelize.where(
                    sequelize.fn("DATE", sequelize.col("dateTime")),
                    getDate
                  ),
                ],
              },
            },
            UserActivityStreaks
          );
          let completeActivity = sumStreaks || 0;
          console.log("540", sumStreaks, completeActivity);
          if (completeActivity != req.user.daily_wellness_goal) {
            await TableSchema.create(
              {
                userActivityId: activities.id,
                userId: req.user.id,
                dateTime: getDate,
                completeActivity: 1,
                daily_wellness_goal: req.user.daily_wellness_goal,
              },
              UserActivityStreaks
            );
          }
          console.log(
            "572",
            completeActivity,
            completeActivity + 1 == req.user.daily_wellness_goal
          );
          if (completeActivity + 1 == req.user.daily_wellness_goal) {
            currentAndHighestStreaks(
              getDate,
              req.user.id,
              completeActivity + 1
            );
          }
        }
      }
      if (
        getDate === moment().tz("Asia/Calcutta").format("yyyy-MM-DD") &&
        status == 0
      ) {
        const activityProgressCount = await TableSchema.count(
          {
            where: {
              userId: req.user.id,
              status: "1",
              [Op.and]: [
                sequelize.where(
                  sequelize.fn("DATE", sequelize.col("dateTime")),
                  getDate
                ),
              ],
            },
          },
          UserActivityProgress
        );

        if (activityProgressCount < req.user.daily_wellness_goal) {
          await TableSchema.delete(
            {
              where: {
                userId: req.user.id,
                [Op.and]: [
                  sequelize.where(
                    sequelize.fn("DATE", sequelize.col("dateTime")),
                    date
                  ),
                ],
                completeActivity: 1,
              },
            },
            UserActivityStreaks
          );

          let current_streaks = req.user.current_streaks
            ? req.user.current_streaks - 1
            : 0;
          let highest_streaks = req.user.highest_streaks
            ? req.user.last_highest_streaks_date == getDate
              ? req.user.highest_streaks - 1
              : req.user.highest_streaks
            : 0;
          let last_update_streaks = current_streaks
            ? req.user.last_update_streaks
            : null;
          let last_highest_streaks_date = highest_streaks
            ? req.user.last_highest_streaks_date
            : null;
          let previous_update_streaks = current_streaks
            ? req.user.last_update_streaks
            : null;
          await TableSchema.update(
            {
              current_streaks: current_streaks,
              highest_streaks: highest_streaks,
              last_update_streaks: last_update_streaks,
              last_highest_streaks_date: last_highest_streaks_date,
              previous_update_streaks: previous_update_streaks,
            },
            { where: { id: req.user.id } },
            Users
          );
        }
      }

      if (activitiesUpdate) {
        const getUserStreaks = await TableSchema.getAll(
          {
            attributes: [
              "daily_wellness_goal",
              [
                sequelize.fn("count", sequelize.col("daily_wellness_goal")),
                "cnt",
              ],
            ],
            where: {
              userId: req.user.id,
              [Op.and]: [
                sequelize.where(
                  sequelize.fn("DATE", sequelize.col("dateTime")),
                  moment().tz("Asia/Calcutta").format("yyyy-MM-DD")
                ),
              ],
            },
            group: ["daily_wellness_goal"],
            raw: true,
          },
          UserActivityStreaks
        );
        if (
          getUserStreaks.length &&
          getUserStreaks[0].daily_wellness_goal == getUserStreaks[0].cnt
        ) {
          is_today_wellness_goal_complete = true;
        }

        let filterDate = moment().tz("Asia/Calcutta").format("yyyy-MM-DD");

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
        let userStreaksCount = await TableSchema.count(
          filter,
          UserActivityProgress
        );
        const currentScore = await getWellnessScore(req.user);
        const { current_score } = await getWellnessScoreArray(
          req.user,
          req.user.previous_wellness_score + currentScore.scoreData
        );
        const current_level = current_score;
        let level_up = null;
        if (current_level.id !== pastLevel.id) {
          level_up = current_level;
        }
        return res.success(
          {
            is_today_wellness_goal_complete,
            daily_wellness_goal: req.user.daily_wellness_goal,
            today_completed_activity: userStreaksCount,
            level_up: level_up,
            previousScore: previousScore,
            currentScore:
              req.user.previous_wellness_score + currentScore.scoreData,
          },
          req.__("UPDATE_ACTIVITY")
        );
      } else {
        return res.warn({}, req.__("UPDATE_ACTIVITY_ERROR"));
      }
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
  deleteActivities = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      const { id } = params;
      let activities = await TableSchema.get(
        { where: { id: id, userId: req.user.id } },
        UserActivities
      );
      if (!activities) {
        return res.warn({}, req.__("ACTIVITY_NOT_FOUND"));
      }
      await TableSchema.delete({ where: { id: id } }, UserActivities);
      await TableSchema.delete(
        { where: { userActivityId: id } },
        UserActivityProgress
      );
      return res.success({}, req.__("DELETE_ACTIVITY"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };

  getWellnessScore = async (req, res) => {
    try {
      const { scoreData, userDays } = await getWellnessScore(req.user);
      const data = {};

      if (userDays > 0) {
        data["wellness_days"] = userDays;
      } else {
        data["wellness_days"] = 1;
      }

      data["wellness_score"] = scoreData + req.user.previous_wellness_score;
      data["today_wellness_score"] = scoreData;

      const { current_score, past_score, next_score } =
        await getWellnessScoreArray(req.user, data.wellness_score);
      data["current_score"] = current_score;
      data["past_score"] = past_score;
      data["next_score"] = next_score;

      // data['till_wellness_score'] = till_wellness_score;
      return res.success(data, req.__("FOUND_WELLNESS_DATA"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };

  getRewardWinner = async (req, res) => {
    try {
      const END = moment()
        .subtract("2", "days")
        .tz("Asia/Calcutta")
        .format("YYYY-MM-DD");
      const yesterDay = moment()
        .subtract("1", "days")
        .tz("Asia/Calcutta")
        .format("YYYY-MM-DD");
      const START = moment(END)
        .subtract("8", "days")
        .tz("Asia/Calcutta")
        .format("YYYY-MM-DD");
      let filterDate = moment().tz("Asia/Calcutta").format("yyyy-MM-DD");

      const yesterDayWinner = await TableSchema.get(
        {
          where: {
            date: {
              [Op.eq]: yesterDay,
            },
          },
          include: {
            model: Users,
            as: "user",
            attributes: [
              "id",
              "name",
              "image",
              "email",
              "current_streaks",
              "highest_streaks",
              "daily_wellness_goal",
              "wellness_score",
              "previous_wellness_score",
              "current_level",
              "created_at",
            ],
          },
        },
        RewardWinners
      );

      if (yesterDayWinner) {
        const total_wellness_score =
          yesterDayWinner.user.wellness_score +
          yesterDayWinner.user.previous_wellness_score;
        const { current_score } = await getWellnessScoreArray(
          yesterDayWinner.user,
          total_wellness_score
        );
        yesterDayWinner["user"]["current_level"] = current_score;
        yesterDayWinner["user"]["wellness_score"] = total_wellness_score;
      }

      const weekWinning = await TableSchema.getAll(
        {
          where: {
            date: {
              [Op.between]: [START, END],
            },
          },
          include: {
            model: Users,
            as: "user",
            attributes: [
              "id",
              "name",
              "image",
              "email",
              "current_streaks",
              "highest_streaks",
              "daily_wellness_goal",
              "wellness_score",
              "previous_wellness_score",
              "current_level",
              "created_at",
            ],
          },
          order: [["id", "DESC"]],
        },
        RewardWinners
      );
      let weekWinningRecord = [];
      if (weekWinning.length) {
        for (let i = 0; i < weekWinning.length; i++) {
          const element = weekWinning[i];
          const total_week_wellness_score =
            element.user.wellness_score + element.user.previous_wellness_score;
          const { current_score } = await getWellnessScoreArray(
            element.user,
            total_week_wellness_score
          );
          element["user"]["wellness_score"] = total_week_wellness_score;
          element["user"]["current_level"] = current_score;

          weekWinningRecord.push(element);
        }
      }
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
      let userStreaksCount = await TableSchema.count(
        filter,
        UserActivityProgress
      );
      const yourGoal = {
        daily_wellness_goal: req.user.daily_wellness_goal,
        today_completed_activity: userStreaksCount,
      };

      return res.success(
        {
          weekWinningRecord,
          yesterDayWinner,
          yourGoal,
          yesterday_winner_hide: req.user.yesterday_winner_hide,
        },
        req.__("FOUND_WINNER_DATA")
      );
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };

  rewardWinnerNotification = async (req, res) => {
    try {
      await winnerNotification();
      return res.success({}, req.__("FOUND_WINNER_DATA"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
}

module.exports = new ActivitiesController();
