const buildingRepo = require("../repositories/building.repository");

async function createBuilding(payload) {
      const type = payload?.generalInfo?.buildingType;

      if (type === 1) {
            if (payload.operation?.commercialOfficeZones?.lenghth) {
                  throw new Error(
                        "Toà nhà loại 1 (Văn phòng công sở nhà nước) không được khai báo commercialOfficeZones"
                  );
            }
      }

      if (type === 2) {
            if (!payload.operation?.governmentOfficeZones?.lenghth) {
                  throw new Error(
                        "Toà nhà loại 2 (Văn phòng thương mại) không được khai báo governmentOfficeZones"
                  );
            }
      }

      const building = await buildingRepo.createBuilding(payload);
      return building;
}

module.exports = {
      createBuilding
};
