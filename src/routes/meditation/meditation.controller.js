const _ = require("lodash");
const MeditationCategories = require("../../../lib/models").meditation_category;
const MeditationSubCategory = require("../../../lib/models").meditation_sub_category;
const MeditationMedia = require("../../../lib/models").meditation_media;
const MeditationMediaCategory = require("../../../lib/models").meditation_media_category;
const MeditationMediaSubCategory = require("../../../lib/models").meditation_media_subcategory;
const UserEnrollment = require("../../../lib/models").user_enrollment;
const MeditationProgramScheduler = require("../../../lib/models").meditation_program_scheduler;
const MeditationSchedulerCategoryTask = require("../../../lib/models").meditation_scheduler_category_task;
const MeditationProgramSchedulerCategory = require("../../../lib/models").meditation_program_scheduler_category;
const UserMeditationProgramTaskStatus = require("../../../lib/models").user_meditation_program_task_status;
const moment = require("moment");
const db = require("../../../lib/models");
const Op = db.Sequelize.Op;
const sequelize = require("sequelize");

const TableSchema = require("../../services");

class MeditatoinController {
  dashboard = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let {
        module_type,
      } = params;

      const currentDate = moment().tz("Asia/Calcutta").format("YYYY-MM-DD");
      let userEnrollData = await TableSchema.getAll(
        {
          where: {userId: req.user.id, programCompletionDate: null},
        },
        UserEnrollment
      );
      var subscriptionData = [];

      if (userEnrollData.length > 0) {
        for (let idx = 0; idx < userEnrollData.length; idx++) {
          const enroll = userEnrollData[idx];

          let meditatoinMedia = await TableSchema.get(
            {
              attributes: MeditationMedia.selectFields(),
              where: { id: enroll.meditationMediaId},
            },
            MeditationMedia
          );

          let meditationMedCat = await TableSchema.get(
            {
              where: {meditationMediaId: meditatoinMedia.id},
            },
            MeditationMediaCategory
          );

          let title = '';
          let description = '';
          let subscribe_module_type = '';

          if (meditationMedCat) {
              let meditatoinCategory = await TableSchema.get(
                {
                  attributes: MeditationCategories.selectFields(),
                  where: { id: meditationMedCat.meditationCategoryId},
                },
                MeditationCategories
              );

              if (meditatoinCategory) {
                title = meditatoinCategory.title;
                description = meditatoinCategory.description;
                subscribe_module_type = meditatoinCategory.module_type;
              }
          }

          if (subscribe_module_type == module_type) {
            //count task
            let totalActivity = await TableSchema.count(
              {
                where: { meditationMediaId: enroll.meditationMediaId, status: 1},
              },
              MeditationSchedulerCategoryTask
            );
            let totalCompletedActivity = await TableSchema.count(
              {
                where: { meditationMediaId: enroll.meditationMediaId, userId: req.user.id},
              },
              UserMeditationProgramTaskStatus
            );
            subscriptionData.push({
              meditationMediaId: enroll.meditationMediaId,
              title: title,
              description: description,
              subscribe_module_type: subscribe_module_type,
              thumbnail_image: meditatoinMedia.thumbnail_image,
              totalActivity: totalActivity,
              totalCompletedActivity: totalCompletedActivity,
            });
          }
        }
      }

      let meditatoinCategories = await TableSchema.getAll(
        {
          attributes: MeditationCategories.selectFields(),
          where: { status: 1, module_type: module_type},
          include: [{ model: MeditationSubCategory}, { model: MeditationMedia,
            limit: 4,
            // where: {
            //   meditationSubCategoryId: {
            //     // "$eq" changes to "[Op.eq]"
            //     [Op.eq]: null
            //   }
            // }
          }],
        },
        MeditationCategories
      );

      let resArray = [];

      if (meditatoinCategories.length) {

        for (let index = 0; index < meditatoinCategories.length; index++) {
          const mediaCat = meditatoinCategories[index];

          let meditationMediaIds = await TableSchema.getAll(
            {
              where: {meditationCategoryId: mediaCat.id, status: 1},
              limit: 4,
              // include: [{ model: MeditationMedia,
              //   limit: 4,
              // }],
            },
            MeditationMediaCategory
          );
          let resArrayNew = [];

          if (meditationMediaIds.length > 0) {

            for (let i = 0; i < meditationMediaIds.length; i++) {
              const mediaCatIndex = meditationMediaIds[i];
              let meditationMedia = await TableSchema.get(
                {
                  attributes: MeditationMedia.selectFields(),
                  where: { status: 1, id: mediaCatIndex.meditationMediaId},
                },
                MeditationMedia
              );

              resArrayNew.push({
                id: meditationMedia.id,
                meditationCategoryId: meditationMedia.meditationCategoryId,
                meditationSubCategoryId: meditationMedia.meditationSubCategoryId,
                title: meditationMedia.title,
                tagline: meditationMedia.tagline,
                // title: mediaCat.title,
                content_category: meditationMedia.content_category,
                content_category_icon: meditationMedia.content_category_icon,
                description: meditationMedia.description,
                // description: mediaCat.description,
                thumbnail_image: meditationMedia.thumbnail_image,
                duration: meditationMedia.duration,
                days: meditationMedia.days,
                type: meditationMedia.type,
                media: meditationMedia.media,
                is_potrait: meditationMedia.is_potrait,
                status: meditationMedia.status,
              });
            }
          }
          meditatoinCategories[index].meditation_media_new = resArrayNew;

          // const mediaCount = await TableSchema.count(
          //   { where: { status: 1, meditationCategoryId: mediaCat.id } },
          //   MeditationMedia
          // );

          const mediaCount = await TableSchema.count(
            {
              where: {meditationCategoryId: mediaCat.id, status: 1},
            },
            MeditationMediaCategory
          );

          resArray.push({
            id: mediaCat.id,
            title: mediaCat.title,
            description: mediaCat.description,
            type: mediaCat.type,
            status: mediaCat.status,
            meditation_sub_categories: mediaCat.meditation_sub_categories,
            meditation_media: mediaCat.meditation_media_new,
            mediaCount: mediaCount,
          });
        }
      }
      const data = {};
      data["subscriptionData"] = subscriptionData;
      data["dashboardData"] = resArray;

      return res.success(data, req.__("GET_MEDITATION_DASHBOARD"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };

  subCategoryDetail = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let {
        subCatId,
      } = params;

      let meditationMediaIds = await TableSchema.getAll(
        {
          where: {meditationSubCategoryId: subCatId, status: 1},
        },
        MeditationMediaSubCategory
      );

      let resArray = [];
      if (meditationMediaIds.length) {
        for (let index = 0; index < meditationMediaIds.length; index++) {
          const act = meditationMediaIds[index];

          let meditationMedia = await TableSchema.get(
            {
              attributes: MeditationMedia.selectFields(),
              where: { status: 1, id: act.meditationMediaId},
            },
            MeditationMedia
          );

          resArray.push({
            id: meditationMedia.id,
            meditationCategoryId: meditationMedia.meditationCategoryId,
            meditationSubCategoryId: meditationMedia.meditationSubCategoryId,
            title: meditationMedia.title,
            content_category: meditationMedia.content_category,
            content_category_icon: meditationMedia.content_category_icon,
            description: meditationMedia.description,
            thumbnail_image: meditationMedia.thumbnail_image,
            duration: meditationMedia.duration,
            days: meditationMedia.days,
            type: meditationMedia.type,
            media: meditationMedia.media,
            is_potrait: meditationMedia.is_potrait,
            status: meditationMedia.status,
          });
        }
      }

      // let meditatoinMedia = await TableSchema.getAll(
      //   {
      //     attributes: MeditationMedia.selectFields(),
      //     where: { status: 1, meditationSubCategoryId: subCatId},
      //   },
      //   MeditationMedia
      // );
      return res.success(resArray, req.__("GET_SUBCATEGORY_DETAIL"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };

  categoryDetail = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let {
        catId,
      } = params;
      let meditationMediaIds = await TableSchema.getAll(
        {
          where: {meditationCategoryId: catId, status: 1},
        },
        MeditationMediaCategory
      );

      let resArray = [];
      if (meditationMediaIds.length) {
        for (let index = 0; index < meditationMediaIds.length; index++) {
          const act = meditationMediaIds[index];

          let meditationMedia = await TableSchema.get(
            {
              attributes: MeditationMedia.selectFields(),
              where: { status: 1, id: act.meditationMediaId},
            },
            MeditationMedia
          );

          resArray.push({
            id: meditationMedia.id,
            meditationCategoryId: meditationMedia.meditationCategoryId,
            meditationSubCategoryId: meditationMedia.meditationSubCategoryId,
            title: meditationMedia.title,
            content_category: meditationMedia.content_category,
            content_category_icon: meditationMedia.content_category_icon,
            description: meditationMedia.description,
            thumbnail_image: meditationMedia.thumbnail_image,
            duration: meditationMedia.duration,
            days: meditationMedia.days,
            type: meditationMedia.type,
            media: meditationMedia.media,
            is_potrait: meditationMedia.is_potrait,
            status: meditationMedia.status,
          });
        }
      }

      // let meditatoinMedia = await TableSchema.getAll(
      //   {
      //     attributes: MeditationMedia.selectFields(),
      //     where: { status: 1, meditationCategoryId: catId},
      //   },
      //   MeditationMedia
      // );
      return res.success(resArray, req.__("GET_CATEGORY_DETAIL"));
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };

  meditationEnrolment = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let {
        meditationMediaId,
      } = params;

      let meditatoinMedia = await TableSchema.get(
        {
          attributes: MeditationMedia.selectFields(),
          where: { id: meditationMediaId},
        },
        MeditationMedia
      );

      var days = 0;

      if (meditatoinMedia) {
        days = meditatoinMedia?.days || 0;
      }

      let createPayload = {
        userId: req.user.id,
        meditationMediaId: meditationMediaId,
        enrollStartDate: moment().tz("Asia/Calcutta").format("YYYY-MM-DD HH:mm"),
        enrollEndDate: moment().add(days, "days").format("YYYY-MM-DD HH:mm"),
        status: 1,
      };
  
      let checkAlreadyEnrollment = await TableSchema.get(
        {
          where: { meditationMediaId: meditationMediaId, userId: req.user.id},
        },
        UserEnrollment
      );

      const currentDate = moment().tz("Asia/Calcutta");
      const endDate = moment(checkAlreadyEnrollment?.enrollEndDate);

      const diffInDays = endDate.diff(currentDate, "days");
      // reEnrollment

      if (checkAlreadyEnrollment && checkAlreadyEnrollment?.programCompletionDate) {
        createPayload['programCompletionDate'] = null;
        const userEnrollData = await TableSchema.update(
          createPayload,
          {
            where: { id: checkAlreadyEnrollment.id },
          },
          UserEnrollment
        );
        createPayload['id'] = checkAlreadyEnrollment.id;

        //delete tasks data
        await TableSchema.delete(
          {
            where: { meditationMediaId: meditationMediaId, userId: req.user.id},
          },
          UserMeditationProgramTaskStatus
        );
        return res.success(createPayload, req.__("RE_ENROLMENT_SUCCESSFULLY"));
      }
      if (checkAlreadyEnrollment && diffInDays < 0) {

      const userEnrollData = await TableSchema.update(
          createPayload,
          {
            where: { id: checkAlreadyEnrollment.id },
          },
          UserEnrollment
        );
        createPayload['id'] = checkAlreadyEnrollment.id
        return res.success(createPayload, req.__("RE_ENROLMENT_SUCCESSFULLY"));

      } else if (checkAlreadyEnrollment && diffInDays >= 0) {
        return res.warn(null, req.__("YOUR_ALREADY_ENROLLED!!"));
      }

      //Insert Data in UserEnrollment
      let userEnrollData = await TableSchema.create(
        createPayload,
        UserEnrollment
      );

      if (userEnrollData) {
        return res.success(userEnrollData, req.__("ENROLMENT_CREATED_SUCCESSFULLY"));  
      } else {
        return res.warn({}, req.__("CREATE_ENROLMENT_ERROR"));
      }
      
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };

  programDetail = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let {
        meditationMediaId,
      } = params;

      let meditatoinMedia = await TableSchema.get(
        {
          attributes: MeditationMedia.selectFields(),
          where: { id: meditationMediaId},
        },
        MeditationMedia
      );

      var days = 0;
      var enrollmentStatus = false;
      var programCompletionDate = '';

      if (meditatoinMedia) {
        days = meditatoinMedia?.days || 0;
      }
  
      let checkAlreadyEnrollment = await TableSchema.get(
        {
          where: { meditationMediaId: meditationMediaId, userId: req.user.id},
        },
        UserEnrollment
      );

      const currentDate = moment().tz("Asia/Calcutta");
      // const endDate = moment(checkAlreadyEnrollment?.enrollEndDate);

      // const diffInDays = endDate.diff(currentDate, "days");
      // if (checkAlreadyEnrollment && diffInDays < 0) {
      //   enrollmentStatus = false;
      // } else if (checkAlreadyEnrollment && diffInDays >= 0) {
      //   enrollmentStatus = true;
      // }

      if (checkAlreadyEnrollment && checkAlreadyEnrollment?.programCompletionDate) {
        enrollmentStatus = false;
        programCompletionDate = checkAlreadyEnrollment?.programCompletionDate;

      } else if (checkAlreadyEnrollment) {
      	enrollmentStatus = true;
      }

      let daysScheduler = await TableSchema.getAll(
        {
          where: { status: 1, meditationMediaId: meditationMediaId},
        },
        MeditationProgramScheduler
      );

      //count task
      let compTotalActivity = await TableSchema.count(
        {
          where: { meditationMediaId: meditationMediaId, status: 1},
        },
        MeditationSchedulerCategoryTask
      );
      let compTotalCompletedActivity = await TableSchema.count(
        {
          where: { meditationMediaId: meditationMediaId, userId: req.user.id},
        },
        UserMeditationProgramTaskStatus
      );

      for (let index = 0; index < daysScheduler.length; index++) {
        let countTotalActivity = await TableSchema.count(
          {
            where: { meditationProgramSchedulerId: daysScheduler[index].id, status: 1},
          },
          MeditationSchedulerCategoryTask
        );

        let totalCompletedActivity = await TableSchema.count(
          {
            where: { meditationProgramSchedulerId: daysScheduler[index].id, userId: req.user.id},
          },
          UserMeditationProgramTaskStatus
        );
        daysScheduler[index].totalActivity = countTotalActivity;
        daysScheduler[index].totalCompletedActivity = totalCompletedActivity;
      }

      meditatoinMedia.enrollmentStatus = enrollmentStatus;
      meditatoinMedia.totalActivity = compTotalActivity;
      meditatoinMedia.totalCompletedActivity = compTotalCompletedActivity;
      meditatoinMedia.programCompletionDate = programCompletionDate;
      meditatoinMedia.daysScheduler = daysScheduler;

      return res.success(meditatoinMedia, req.__("RECORD_FOUND"));
      
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };

  dayDetail = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let {
        meditationProgramSchedulerId,
      } = params;
      

      let schedulerCategory = await TableSchema.getAll(
        {
          where: { status: 1},
        },
        MeditationProgramSchedulerCategory
      );

      let resArray = [];      

      for (let index = 0; index < schedulerCategory.length; index++) {
        let activities = await TableSchema.getAll(
          {
            where: { meditationProgramSchedulerId: meditationProgramSchedulerId, status: 1, meditationProgramSchedulerCategoryId: schedulerCategory[index].id},
          },
          MeditationSchedulerCategoryTask
        );

        if (activities.length > 0) {
          for (let idx = 0; idx < activities.length; idx++) {
            const element = activities[idx];

            let checkAlreadyCompleted = await TableSchema.get(
              {
                where: { meditationProgramSchedulerCategoryTaskId: element.id, userId: req.user.id},
              },
              UserMeditationProgramTaskStatus
            );

            if (checkAlreadyCompleted) {
              activities[idx].isTaskCompleted = true;
            } else {
              activities[idx].isTaskCompleted = false;
            }
          }
        }

        resArray.push({
          title: schedulerCategory[index].title,
          activities: activities
        });
      }

      return res.success(resArray, req.__("RECORD_FOUND"));
      
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };

  completeDayTask = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let {
        meditationProgramSchedulerCategoryTaskId,
      } = params;

      let taskDetail = await TableSchema.get(
        {
          where: { id: meditationProgramSchedulerCategoryTaskId},
        },
        MeditationSchedulerCategoryTask
      );

      var meditationMediaId = '';
      var meditationProgramSchedulerId = '';

      if (taskDetail) {
        meditationProgramSchedulerId = taskDetail?.meditationProgramSchedulerId || '';

        let schedulerDetail = await TableSchema.get(
          {
            where: { id: meditationProgramSchedulerId},
          },
          MeditationProgramScheduler
        );

        meditationMediaId = schedulerDetail?.meditationMediaId || '';
      }

      let createPayload = {
        userId: req.user.id,
        meditationProgramSchedulerCategoryTaskId: meditationProgramSchedulerCategoryTaskId,
        meditationProgramSchedulerId: meditationProgramSchedulerId,
        meditationMediaId: meditationMediaId,
        status: 1,
      };
  
      let checkAlreadyCompleted = await TableSchema.get(
        {
          where: { meditationProgramSchedulerCategoryTaskId: meditationProgramSchedulerCategoryTaskId, userId: req.user.id},
        },
        UserMeditationProgramTaskStatus
      );

      if (checkAlreadyCompleted) {
        return res.warn(null, req.__("YOUR_ALREADY_COMPLETED!!"));
      } else {
        //Insert Data in UserEnrollment
        let userCompletionData = await TableSchema.create(
          createPayload,
          UserMeditationProgramTaskStatus
        );

        //count task
        let totalActivity = await TableSchema.count(
          {
            where: { meditationMediaId: meditationMediaId, status: 1},
          },
          MeditationSchedulerCategoryTask
        );
        let totalCompletedActivity = await TableSchema.count(
          {
            where: { meditationMediaId: meditationMediaId, userId: req.user.id},
          },
          UserMeditationProgramTaskStatus
        );
        //update userEnrollment
        if (totalActivity == totalCompletedActivity) {
          await TableSchema.update(
            {
              programCompletionDate: moment().tz("Asia/Calcutta").format("YYYY-MM-DD"),
            },
            {
              where: { meditationMediaId: meditationMediaId, userId: req.user.id},
            },
            UserEnrollment
          );
        }

        let data = {};
        data['totalActivity'] = totalActivity;
        data['totalCompletedActivity'] = totalCompletedActivity;

        if (userCompletionData) {
          return res.success(data, req.__("TASK_COMPLETED_SUCCESSFULLY"));  
        } else {
          return res.warn({}, req.__("TASK_COMPLETION_ERROR"));
        }
      }
      
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };

  leaveProgram = async (req, res) => {
    try {
      const params = _.extend(
        req.query || {},
        req.params || {},
        req.body || {}
      );
      let {
        meditationMediaId,
      } = params;

      // let meditatoinMedia = await TableSchema.get(
      //   {
      //     attributes: MeditationMedia.selectFields(),
      //     where: { id: meditationMediaId},
      //   },
      //   MeditationMedia
      // );

      //delete tasks data
      await TableSchema.delete(
        {
          where: { meditationMediaId: meditationMediaId, userId: req.user.id},
        },
        UserMeditationProgramTaskStatus
      );

      //delete enrollment data
      await TableSchema.delete(
        {
          where: { meditationMediaId: meditationMediaId, userId: req.user.id},
        },
        UserEnrollment
      );

      return res.success({}, req.__("RECORD_DELETED"));
      
    } catch (error) {
      return res.serverError({}, req.__("SERVER_ERROR"), error);
    }
  };
}

module.exports = new MeditatoinController();
