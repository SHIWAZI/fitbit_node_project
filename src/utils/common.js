const FCM = require("fcm-push");
const moment = require("moment");
const db = require("../../lib/models");
const Sequelize = require("sequelize");
const UserActivities = require("../../lib/models").user_activities;
const ActivityProgress = require("../../lib/models").activity_progress;
const Notifications = require("../../lib/models").notifications;
const Users = require("../../lib/models").users;
const UserActivityStreaks = require("../../lib/models").user_activity_streaks;
const WellnessScore = require("../../lib/models").wellness_score;
const RewardWinners = require("../../lib/models").reward_winners;
const CouponCards = require("../../lib/models").coupon_cards;
const logger = require("./logger");
const { sendMail } = require("../../lib/mailer/index");
const TableSchema = require("../services");

const Op = db.Sequelize.Op;
var cron = require("node-cron");
// Every 10 Sec
cron.schedule(
  "*/10 * * * * *",
  () => {
    // Normal User Activity Notification Send
    getActivityProgress();
    // End User Activity Notification send
    getEndActivityNotification();
  },
  {
    scheduled: true,
    timezone: "Asia/Calcutta",
  }
);
// Every Night 11:55:59 PM
cron.schedule(
  "59 55 23 * * *",
  () => {
    // CompletedActivity Status Change 2
    getCompletedActivity();
    // Streak Reset For All user
    currentStreaksResetAllUser();
    // Winner Reward Declare
    // getRewardWinner();
  },
  {
    scheduled: true,
    timezone: "Asia/Calcutta",
  }
);
//Every Night 09 PM
cron.schedule(
  "00 00 21 * * *",
  () => {
    // Every Night Notification
    everyNightNotification();
  },
  {
    scheduled: true,
    timezone: "Asia/Calcutta",
  }
);
//Every Morning 07 AM
cron.schedule(
  "00 00 07 * * *",
  () => {
    // Every Morning Notification
    everyMorningNotification();
  },
  {
    scheduled: true,
    timezone: "Asia/Calcutta",
  }
);
//Every Morning 10 AM
cron.schedule(
  "00 00 10 * * *",
  () => {
    // Winner Notification
    // winnerNotification();
  },
  {
    scheduled: true,
    timezone: "Asia/Calcutta",
  }
);

// Every Evening 05 PM
cron.schedule(
  "00 00 17 * * *",
  () => {
    // Complete the streak Notification
    completeStreakNotification();
  },
  {
    scheduled: true,
    timezone: "Asia/Calcutta",
  }
);
const getPlatform = (req) => req.headers["x-platform"];
const getLanguage = (req) => req.headers["accept-language"];

const sendNotification = async (
  userID,
  type = "user",
  table_id,
  table_name,
  title,
  message,
  user_type = "0"
) => {
  try {
    if (type == "user") {
      const userData = await TableSchema.get({ where: { id: userID } }, Users);
      const notifyObj = {
        user_type: user_type,
        title: title,
        description: message,
        from_id: userData.id,
        to_id: userData.id,
        table_name: table_name,
        table_id: table_id,
        is_read: false,
        is_status: false,
      };
      await TableSchema.create(notifyObj, Notifications);
      if (userData.device_token && userData.device_token != "") {
        if (
          userData.device_type == "Android" ||
          userData.device_type == "IOS"
        ) {
          let payload = { type: table_name };
          payload.message = message;
          payload.title = title;
          payload.order_id = table_id;
          const msg = {
            to: userData.device_token,
            collapse_key: "green",
            notification: {
              title: title,
              body: message,
            },
            data: payload,
          };
          const fcm = new FCM(process.env.USER_FCM);
          try {
            let send = await fcm.send(msg);
            console.log("success", send);
          } catch (error) {
            console.log("error", error);
          }
        }
      }
    }
  } catch (e) {
    // Log Errors
    logger.error(`${500} - [ '' ] - ${e}`);
    console.log(e);
  }
};
const everyNightNotification = async () => {
  try {
    const nightArray = [
      {
        title: "Have a good night.",
        type: "5",
        description: "We hope you had a great day today, too.",
      },
      {
        title: "Good night.",
        type: "5",
        description:
          "Rest well, dream big, and wake up ready to conquer the world!",
      },
      {
        title: "Good night.",
        type: "5",
        description: "Don't miss your streak.",
      },
    ];
    const userData = await TableSchema.getAll(
      { where: { status: 1 }, raw: true },
      Users
    );
    if (userData.length) {
      for (let index = 0; index < userData.length; index++) {
        const element = userData[index];
        const notificationCount = await TableSchema.count(
          { where: { to_id: element.id, user_type: "5" } },
          Notifications
        );
        if (notificationCount === 0) {
          sendNotification(
            element.id,
            "user",
            element.id,
            "user",
            nightArray[0].title,
            nightArray[0].description,
            nightArray[0].type
          );
        } else {
          if (notificationCount % 3 == 0) {
            sendNotification(
              element.id,
              "user",
              element.id,
              "user",
              nightArray[0].title,
              nightArray[0].description,
              nightArray[0].type
            );
          } else {
            if (notificationCount % 2 == 0) {
              sendNotification(
                element.id,
                "user",
                element.id,
                "user",
                nightArray[2].title,
                nightArray[2].description,
                nightArray[2].type
              );
            } else {
              sendNotification(
                element.id,
                "user",
                element.id,
                "user",
                nightArray[1].title,
                nightArray[1].description,
                nightArray[1].type
              );
            }
          }
        }
      }
    }
  } catch (e) {
    logger.error(`${500} - [ 'everyNightNotification' ] - ${e}`);
    console.log(e);
  }
};
const everyMorningNotification = async () => {
  try {
    const morningArray = [
      {
        title: "Good morning.",
        type: "6",
        description: "Today will be great.",
      },
      {
        title: "Good morning.",
        type: "6",
        description: "Today is a gift. Treat it like a present.",
      },
      {
        title: "Good morning.",
        type: "6",
        description: "Sending lots of good wishes your way.",
      },
    ];
    const userData = await TableSchema.getAll(
      { where: { status: 1 }, raw: true },
      Users
    );
    if (userData.length) {
      for (let index = 0; index < userData.length; index++) {
        const element = userData[index];
        const notificationCount = await TableSchema.count(
          { where: { to_id: element.id, user_type: "6" } },
          Notifications
        );
        if (notificationCount === 0) {
          sendNotification(
            element.id,
            "user",
            element.id,
            "user",
            morningArray[0].title,
            morningArray[0].description,
            morningArray[0].type
          );
        } else {
          if (notificationCount % 3 == 0) {
            sendNotification(
              element.id,
              "user",
              element.id,
              "user",
              morningArray[0].title,
              morningArray[0].description,
              morningArray[0].type
            );
          } else {
            if (notificationCount % 2 == 0) {
              sendNotification(
                element.id,
                "user",
                element.id,
                "user",
                morningArray[2].title,
                morningArray[2].description,
                morningArray[2].type
              );
            } else {
              sendNotification(
                element.id,
                "user",
                element.id,
                "user",
                morningArray[1].title,
                morningArray[1].description,
                morningArray[1].type
              );
            }
          }
        }
      }
    }
  } catch (e) {
    logger.error(`${500} - [ 'everyMorningNotification' ] - ${e}`);
    console.log(e);
  }
};

const winnerNotification = async () => {
  try {
    let previousDay = moment()
      .subtract(1, "days")
      .tz("Asia/Calcutta")
      .format("yyyy-MM-DD");
    const previousDayWinner = await TableSchema.get(
      {
        where: { date: previousDay },
      },
      RewardWinners
    );
    if (previousDayWinner) {
      const userData = await TableSchema.get(
        {
          where: { id: previousDayWinner.userId },
        },
        Users
      );

      sendNotification(
        previousDayWinner.userId,
        "user",
        previousDayWinner.id,
        "reward_winners",
        "Congratulations!",
        "You just won.",
        "4"
      );
      let coupon = await TableSchema.get(
        {
          where: { id: previousDayWinner.couponCardId },
        },
        CouponCards
      );
      if (coupon) {
        await TableSchema.update(
          { status: "2" },
          { where: { id: coupon.id } },
          CouponCards
        );
        sendMail(
          "winner-email",
          "Congratulations. You've just won!",
          userData.email,
          {
            email: `${userData.name}`,
            couponCode: `${coupon.gift_card_code}`,
            amount: `${coupon.amount}`,
            currency_code: `${coupon.currency_code}`,
            expiry_date: `${coupon.expiry_date}`,
            term_condition: `${coupon.term_condition}`,
            reference_id: `${coupon.reference_id}`,
          }
        );
      }
    }
    const userData = await TableSchema.getAll(
      { where: { status: 1 }, raw: true },
      Users
    );
    if (userData.length) {
      for (let index = 0; index < userData.length; index++) {
        const element = userData[index];
        const days = await TableSchema.getAll(
          {
            where: { userId: element.id, status: 1 },
            attributes: [
              [Sequelize.fn("DATE", Sequelize.col("dateTime")), "Date"],
            ],
            group: ["Date"],
            raw: true,
          },
          ActivityProgress
        );
        const userDays = days.length ? days.length : 0;
        if (userDays && userDays % 7 === 0) {
          sendNotification(
            element.id,
            "user",
            element.id,
            "user",
            "You just did 7 days of wellness ",
            "You're on fire. We couldn't be happier. ",
            "7"
          );
        }
      }
    }
  } catch (e) {
    logger.error(`${500} - [ 'winnerNotification' ] - ${e}`);
    console.log(e);
  }
};
const completeStreakNotification = async () => {
  try {
    let filterDate = moment().tz("Asia/Calcutta").format("yyyy-MM-DD");

    const userData = await TableSchema.getAll(
      { where: { status: 1 }, raw: true },
      Users
    );
    if (userData.length) {
      for (let index = 0; index < userData.length; index++) {
        const element = userData[index];

        let filter = {
          where: {
            userId: element.id,
            status: "1",
            dateTime: {
              [Op.and]: {
                [Op.gte]: filterDate + " 00:00",
                [Op.lte]: filterDate + " 23:59",
              },
            },
          },
        };
        let userActivityProgressCount = await TableSchema.count(
          filter,
          ActivityProgress
        );
        let count = element.daily_wellness_goal - userActivityProgressCount;
        if (count > 0) {
          sendNotification(
            element.id,
            "user",
            element.id,
            "user",
            `Just ${count} left to complete today's goal.`,
            "Don't miss your streak.",
            "8"
          );
        }

        const { scoreData } = await getWellnessScore(element);
        const total_wellness_score =
          scoreData + element.previous_wellness_score;
        let current_score = await TableSchema.get(
          {
            where: {
              start_point: { [Sequelize.Op.lte]: total_wellness_score },
              [Op.or]: [
                { end_point: { [Sequelize.Op.gte]: total_wellness_score } },
                { end_point: null },
              ],
            },
          },
          WellnessScore
        );

        if (current_score) {
          const percentage =
            (total_wellness_score / current_score.end_point) * 100;
          const leftPoint = current_score.end_point - total_wellness_score;

          if (percentage > 90) {
            sendNotification(
              element.id,
              "user",
              element.id,
              "user",
              `You're levelling up! Just ${leftPoint} are left to reach the next level. Keep up the fantastic work!`,
              "",
              "9"
            );
          }
        }
      }
    }
  } catch (e) {
    logger.error(`${500} - [ 'completeStreakNotification' ] - ${e}`);
    console.log(e);
  }
};

const getEndActivityNotification = async () => {
  try {
    let filterDate = moment().tz("Asia/Calcutta").format("yyyy-MM-DD");
    let weekDay = moment(filterDate).tz("Asia/Calcutta").format("ddd");
    let filterTime = moment().tz("Asia/Calcutta").format("HH:mm");
    const currentDateTime = moment()
      .tz("Asia/Calcutta")
      .format("yyyy-MM-DD HH:mm");
    let endSActivities = await TableSchema.getAll(
      { where: { time: { [Op.eq]: filterTime }, repeat_count: "end" } },
      UserActivities
    );
    for (let end = 0; end < endSActivities.length; end++) {
      let endActivity = endSActivities[end];
      if (
        endActivity.date <= filterDate &&
        endActivity.weeks_slug === "every_other_day" &&
        endActivity.repeat_count == "end"
      ) {
        var date2 = moment(endActivity.date); // Assuming the current date

        var diffDays = date2.diff(filterDate, "days");
        if (diffDays % 2 === 0) {
          const activityProgress = await TableSchema.count(
            {
              where: {
                userActivityId: endActivity.id,
                status: 0,
                send_notify: 1,
              },
            },
            ActivityProgress
          );
          if (!activityProgress) {
            await TableSchema.create(
              {
                userActivityId: endActivity.id,
                userId: endActivity.userId,
                dateTime: currentDateTime,
                send_date_time: currentDateTime,
                weeks: weekDay,
                send_notify: "1",
                status: "0",
              },
              ActivityProgress
            );

            sendNotification(
              endActivity.userId,
              "user",
              endActivity.id,
              "user_activities",
              "Time for your wellness :" + endActivity.name,
              "No stress. Just reminding you about your wellness routine. ",
              "0"
            );
          }
        }
      }
      if (
        endActivity.date <= filterDate &&
        endActivity.repeat_count == "end" &&
        endActivity.weekdays != "" &&
        endActivity.weekdays.includes(weekDay)
      ) {
        const activityProgress = await TableSchema.count(
          {
            where: {
              userActivityId: endActivity.id,
              status: 0,
              send_notify: 1,
            },
          },
          ActivityProgress
        );
        if (!activityProgress) {
          await TableSchema.create(
            {
              userActivityId: endActivity.id,
              userId: endActivity.userId,
              dateTime: currentDateTime,
              send_date_time: currentDateTime,
              weeks: weekDay,
              send_notify: "1",
              status: "0",
            },
            ActivityProgress
          );

          sendNotification(
            endActivity.userId,
            "user",
            endActivity.id,
            "user_activities",
            "Time for your wellness :" + endActivity.name,
            "No stress. Just reminding you about your wellness routine. ",
            "0"
          );
        }
      }
    }
  } catch (e) {
    // Log Errors
    logger.error(`${500} - [ 'getEndActivityNotification' ] - ${e}`);
    console.log(e);
  }
};
const getActivityProgress = async () => {
  try {
    const dateTime = moment().format("yyyy-MM-DD HH:mm");
    const currentDateTime = moment()
      .tz("Asia/Calcutta")
      .format("yyyy-MM-DD HH:mm");
    const activityProgress = await TableSchema.getAll(
      {
        where: {
          send_date_time: { [Sequelize.Op.eq]: currentDateTime },
          status: 0,
          send_notify: 0,
        },
      },
      ActivityProgress
    );
    if (activityProgress.length) {
      for (let index = 0; index < activityProgress.length; index++) {
        const element = activityProgress[index];
        const activityUser = await TableSchema.get(
          { where: { id: element.userActivityId } },
          UserActivities
        );
        if (activityUser && activityUser.time != "") {
          sendNotification(
            activityUser.userId,
            "user",
            activityUser.id,
            "user_activities",
            "Time for your wellness :" + activityUser.name,
            "No stress. Just reminding you about your wellness routine.",
            "0"
          );
        }
        await TableSchema.update(
          { send_notify: 1 },
          { where: { id: element.id } },
          ActivityProgress
        );
      }
    }
  } catch (e) {
    // Log Errors
    logger.error(`${500} - [ 'getActivityProgress' ] - ${e}`);
    console.log(e);
  }
};
getArrayDate = (date, weekArray, repeat, reminder, weeks_slug) => {
  let weekDayArray = [];
  let i = 0;
  while (weekDayArray.length <= repeat) {
    if (weeks_slug === "every_other_day") {
      if (i == 0) {
        weekDayArray.push({
          date: moment(date, "YYYY-MM-DD HH:mm")
            .add(i, "d")
            .format("YYYY-MM-DD HH:mm"),
          reminderDateTime: moment(date, "YYYY-MM-DD HH:mm")
            .add(i, "d")
            .format("YYYY-MM-DD HH:mm"),
          days: moment(date).add(i, "d").format("ddd"),
        });
      } else {
        let nextDate = moment(date, "YYYY-MM-DD HH:mm")
          .add(i, "d")
          .format("YYYY-MM-DD HH:mm");
        let weekDayString = moment(date).add(i, "d").format("ddd");

        let reminderNotificationDateTime = moment(date, "YYYY-MM-DD HH:mm")
          .add(i, "d")
          .format("YYYY-MM-DD HH:mm");

        weekDayArray.push({
          date: nextDate,
          reminderDateTime: reminderNotificationDateTime,
          days: weekDayString,
        });
      }
      i += 2;
    } else {
      let nextDate = moment(date, "YYYY-MM-DD HH:mm")
        .add(i, "d")
        .format("YYYY-MM-DD HH:mm");
      let weekDayString = moment(date).add(i, "d").format("ddd");

      let reminderNotificationDateTime = moment(date, "YYYY-MM-DD HH:mm")
        .add(i, "d")
        .format("YYYY-MM-DD HH:mm");
      if (reminder != "") {
        reminderNotificationDateTime = moment(date, "YYYY-MM-DD HH:mm")
          .add(i, "d")
          .subtract(reminder, "minutes")
          .format("YYYY-MM-DD HH:mm");
      }
      if (weekArray.length !== 0 && weekArray.includes(weekDayString)) {
        weekDayArray.push({
          date: nextDate,
          reminderDateTime: reminderNotificationDateTime,
          days: weekDayString,
        });
      } else {
        if (weekArray.length == 0) {
          weekDayArray.push({
            date: nextDate,
            reminderDateTime: reminderNotificationDateTime,
            days: weekDayString,
          });
        }
      }
      i++;
    }
  }

  return weekDayArray;
};

const currentAndHighestStreaks = async (date, userId, completeActivity) => {
  try {
    const userData = await TableSchema.get({ where: { id: userId } }, Users);

    // if (
    //   userData.last_update_streaks == null ||
    //   date != userData.last_update_streaks
    // ) {
    const current_streaks =
      completeActivity == userData.daily_wellness_goal
        ? userData.current_streaks + 1
        : 1;

    await TableSchema.update(
      {
        current_streaks: current_streaks,
        last_update_streaks: date,
        previous_update_streaks: userData.last_update_streaks
          ? userData.last_update_streaks
          : date,
      },
      { where: { id: userData.id } },
      Users
    );
    //}
  } catch (e) {
    logger.error(`${500} - [ 'currentAndHighestStreaks' ] - ${e}`);
    console.log(e);
  }
};

const currentStreaksResetAllUser = async () => {
  try {
    console.log(
      "currentStreaksResetAllUser" +
        moment().tz("Asia/Calcutta").format("yyyy-MM-DD HH:mm")
    );
    const userData = await TableSchema.getAll(
      { where: { status: 1 }, raw: true },
      Users
    );
    var date = moment().tz("Asia/Calcutta").format("yyyy-MM-DD");
    if (userData.length) {
      for (let index = 0; index < userData.length; index++) {
        const element = userData[index];
        const getUserStreaks = await TableSchema.getAll(
          {
            attributes: [
              "daily_wellness_goal",
              [
                Sequelize.fn("count", Sequelize.col("daily_wellness_goal")),
                "cnt",
              ],
            ],
            where: {
              userId: element.id,
              [Op.and]: [
                Sequelize.where(
                  Sequelize.fn("DATE", Sequelize.col("dateTime")),
                  date
                ),
              ],
            },
            group: ["daily_wellness_goal"],
            raw: true,
          },
          UserActivityStreaks
        );
        if (getUserStreaks.length === 0) {
          const highest_streaks =
            element.current_streaks &&
            element.current_streaks >= element.highest_streaks
              ? element.highest_streaks + 1
              : element.highest_streaks;
          await TableSchema.update(
            {
              current_streaks: 0,
              last_update_streaks: date,
              highest_streaks: highest_streaks,
              last_highest_streaks_date: date,
            },
            { where: { id: element.id } },
            Users
          );
        }
        await TableSchema.update(
          {
            daily_wellness_goal: element.today_wellness_goal,
            today_wellness_goal: element.today_wellness_goal,
          },
          { where: { id: element.id } },
          Users
        );
        updateTodayWellnessScore(element);
      }
    }
  } catch (e) {
    logger.error(`${500} - [ 'currentStreaksResetAllUser' ] - ${e}`);
    console.log(e);
  }
};

const getCompletedActivity = async () => {
  try {
    let filterDate = moment()
      .subtract(2, "days")
      .tz("Asia/Calcutta")
      .format("yyyy-MM-DD");
    await TableSchema.update(
      {
        status: 2,
      },
      {
        where: {
          status: 1,
          repeat_count: { [Sequelize.Op.not]: "end" },
          endDate: { [Sequelize.Op.lte]: filterDate },
        },
      },
      UserActivities
    );
  } catch (e) {
    logger.error(`${500} - [ 'getCompletedActivity' ] - ${e}`);
    console.log(e);
  }
};

const getAllDateWiseActivity = async (activities, filterDate, weekDay) => {
  try {
    let ongoing = [];
    let complete = [];
    let skipped = [];
    for (let i = 0; i < activities.length; i++) {
      let activity = activities[i];

      if (
        activity.date <= filterDate &&
        activity.repeat_count == "end" &&
        activity.weekdays != "" &&
        activity.weekdays.includes(weekDay)
      ) {
        let activityProgress = await TableSchema.get(
          {
            where: {
              userActivityId: activity.id,
              [Op.and]: [
                Sequelize.where(
                  Sequelize.fn("date", Sequelize.col("dateTime")),
                  "=",
                  filterDate
                ),
              ],
            },
            order: [["updatedAt", "DESC"]],
          },
          ActivityProgress
        );

        let activityObject = {
          id: activityProgress?.id || "",
          userActivityId: activity.id,
          activitiesId: activity.activityId,
          name: activity.name,
          description: activity.description,
          date: activity.date,
          time: activity.time,
          weeks_slug: activity.weeks_slug,
          weekdays: activity.weekdays,
          reminder: activity.reminder,
          repeat_count: activity.repeat_count,
        };
        if (
          (activityProgress && activityProgress?.status === 0) ||
          activityProgress?.status === 4
        ) {
          activityObject["status"] = 0;
          ongoing.push(activityObject);
        } else if (activityProgress && activityProgress?.status === 1) {
          activityObject["status"] = 1;
          complete.push(activityObject);
        } else if (activityProgress && activityProgress?.status === 2) {
          activityObject["status"] = 2;
          skipped.push(activityObject);
        } else {
          activityObject["status"] = 0;
          ongoing.push(activityObject);
        }
      } else {
        if (activity.repeat_count != "end") {
          let activityProgress = await TableSchema.get(
            {
              where: {
                userActivityId: activity.id,
                [Op.and]: [
                  Sequelize.where(
                    Sequelize.fn("DATE", Sequelize.col("dateTime")),
                    filterDate
                  ),
                ],
              },
              order: [["updatedAt", "DESC"]],
            },
            ActivityProgress
          );
          if (activityProgress) {
            let activityObject = {
              id: activityProgress.id || "",
              userActivityId: activity.id,
              activitiesId: activity.activityId,
              name: activity.name,
              description: activity.description,
              date: activity.date,
              time: activity.time,
              weeks_slug: activity.weeks_slug,
              weekdays: activity.weekdays,
              reminder: activity.reminder,
              repeat_count: activity.repeat_count,
            };
            if (
              activityProgress.status === 0 ||
              activityProgress.status === 4
            ) {
              activityObject["status"] = 0;
              ongoing.push(activityObject);
            } else if (activityProgress.status === 1) {
              activityObject["status"] = 1;
              complete.push(activityObject);
            } else if (activityProgress.status === 2) {
              activityObject["status"] = 2;
              skipped.push(activityObject);
            }
          }
        }
        if (
          activity.date <= filterDate &&
          activity.weeks_slug === "every_other_day" &&
          activity.repeat_count == "end"
        ) {
          var date2 = moment(activity.date); // Assuming the current date

          var diffDays = date2.diff(filterDate, "days");
          if (diffDays % 2 === 0) {
            let activityProgress = await TableSchema.get(
              {
                where: {
                  userActivityId: activity.id,
                  [Op.and]: [
                    Sequelize.where(
                      Sequelize.fn("DATE", Sequelize.col("dateTime")),
                      filterDate
                    ),
                  ],
                },
                order: [["updatedAt", "DESC"]],
              },
              ActivityProgress
            );
            let activityObject = {
              id: activityProgress?.id || "",
              userActivityId: activity.id,
              activitiesId: activity.activityId,
              name: activity.name,
              description: activity.description,
              date: activity.date,
              time: activity.time,
              weeks_slug: activity.weeks_slug,
              weekdays: activity.weekdays,
              reminder: activity.reminder,
              repeat_count: activity.repeat_count,
            };
            if (
              (activityProgress && activityProgress?.status === 0) ||
              activityProgress?.status === 4
            ) {
              activityObject["status"] = 0;
              ongoing.push(activityObject);
            } else if (activityProgress && activityProgress?.status === 1) {
              activityObject["status"] = 1;
              complete.push(activityObject);
            } else if (activityProgress && activityProgress?.status === 2) {
              activityObject["status"] = 2;
              skipped.push(activityObject);
            } else {
              activityObject["status"] = 0;
              ongoing.push(activityObject);
            }
          }
        }
      }
    }

    return {
      ongoing,
      skipped,
      complete,
      ongoingCount: ongoing.length,
      completeCount: complete.length,
    };
  } catch (e) {
    logger.error(`${500} - [ 'getAllDateWiseActivity' ] - ${e}`);
    console.log(e);
  }
};

const getRewardWinner = async () => {

};

// const getRewardWinner = async () => {
//   try {
//     let filterDate = moment().tz("Asia/Calcutta").format("yyyy-MM-DD");
//     const userData = await TableSchema.getAll(
//       { where: { status: 1 }, raw: true },
//       Users
//     );
//     if (userData.length) {
//       const eligible_winners = [];
//       for (let index = 0; index < userData.length; index++) {
//         const element = userData[index];
//         let filter = {
//           where: {
//             userId: element.id,
//             [Op.and]: [
//               Sequelize.where(
//                 Sequelize.fn("DATE", Sequelize.col("dateTime")),
//                 filterDate
//               ),
//             ],
//           },
//         };
//         let userStreaksCount = await TableSchema.count(
//           filter,
//           UserActivityStreaks
//         );
//         if (userStreaksCount == element.daily_wellness_goal) {
//           eligible_winners.push(element.id);
//         }

//         await TableSchema.update(
//           {
//             yesterday_winner_hide: 0,
//           },
//           { where: { id: element.id } },
//           Users
//         );
//       }
//       if (eligible_winners.length) {
//         const winner =
//           eligible_winners[Math.floor(Math.random() * eligible_winners.length)];
//         let couponId = await TableSchema.getAll(
//           {
//             where: { status: 1 },
//             order: [["id", "ASC"]],
//             limit: 1,
//             raw: true,
//           },
//           CouponCards
//         );

//         if (winner && couponId.length) {
//           await TableSchema.create(
//             {
//               userId: winner,
//               date: filterDate,
//               couponCardId: couponId[0].id,
//             },
//             RewardWinners
//           );
//         }
//       }
//     }
//   } catch (e) {
//     logger.error(`${500} - [ 'getRewardWinner' ] - ${e}`);
//     console.log(e);
//   }
// };

const updateTodayWellnessScore = async (userData) => {
  try {
    let todayDate = moment().tz("Asia/Calcutta").format("yyyy-MM-DD");
    let todayActivityDone = await TableSchema.getAll(
      {
        where: {
          userId: userData.id,
          status: 1,
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn("date", Sequelize.col("dateTime")),
              "=",
              todayDate
            ),
          ],
        },
        raw: true,
      },
      ActivityProgress
    );
    let userDays = await TableSchema.getAll(
      {
        where: { userId: userData.id, status: 1 },
        attributes: [[Sequelize.fn("DATE", Sequelize.col("dateTime")), "Date"]],
        group: ["Date"],
        raw: true,
      },
      ActivityProgress
    );
    if (todayActivityDone.length) {
      let todayScore =
        todayActivityDone.length * 10 +
        userDays.length * 4 +
        (userData.current_streaks ? userData.current_streaks : 0) * 8;
      await TableSchema.update(
        {
          previous_wellness_score:
            todayScore + userData.previous_wellness_score,
        },
        { where: { id: userData.id } },
        Users
      );
    }
  } catch (e) {
    logger.error(`${500} - [ 'updateWellnessScore' ] - ${e}`);
    console.log(e);
  }
};

const getWellnessScore = async (userData) => {
  try {
    let todayDate = moment().tz("Asia/Calcutta").format("yyyy-MM-DD");
    const days = await TableSchema.getAll(
      {
        where: { userId: userData.id, status: 1 },
        attributes: [[Sequelize.fn("DATE", Sequelize.col("dateTime")), "Date"]],
        group: ["Date"],
        raw: true,
      },
      ActivityProgress
    );
    const userDays = days.length ? days.length : 0;
    let todayActivityDone = await TableSchema.getAll(
      {
        where: {
          userId: userData.id,
          status: 1,
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn("date", Sequelize.col("dateTime")),
              "=",
              todayDate
            ),
          ],
        },
        raw: true,
      },
      ActivityProgress
    );

    let todayScore =
      todayActivityDone.length * 10 +
      userDays * 4 +
      (userData.current_streaks ? userData.current_streaks : 0) * 8;

    console.log("todayScore", todayScore);
    return { scoreData: todayScore, userDays: userDays };
  } catch (e) {
    logger.error(`${500} - [ 'getWellnessScore' ] - ${e}`);
    console.log(e);
  }
};

const getWellnessScoreArray = async (userData, totalWellnessScore) => {
  try {
    let current_score = await TableSchema.get(
      {
        where: {
          start_point: { [Sequelize.Op.lte]: totalWellnessScore },
          [Op.or]: [
            { end_point: { [Sequelize.Op.gte]: totalWellnessScore } },
            { end_point: null },
          ],
        },
      },
      WellnessScore
    );

    let past_score = await TableSchema.getAll(
      {
        where: {
          start_point: { [Sequelize.Op.lt]: current_score.start_point },
        },
      },
      WellnessScore
    );

    let next_score = await TableSchema.getAll(
      { where: { start_point: { [Sequelize.Op.gt]: totalWellnessScore } } },
      WellnessScore
    );

    return { current_score, past_score, next_score };
  } catch (e) {
    logger.error(`${500} - [ 'getWellnessScoreArray' ] - ${e}`);
    console.log(e);
  }
};

module.exports = {
  sendNotification,
  getPlatform,
  getLanguage,
  getArrayDate,
  currentAndHighestStreaks,
  getAllDateWiseActivity,
  getWellnessScore,
  getWellnessScoreArray,
  winnerNotification,
};
