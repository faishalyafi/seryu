import sq from "./config/connection";
import { DataTypes } from "sequelize";
import csv from "csvtojson";

const Driver = sq.define('drivers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  driver_code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
},{
  freezeTableName: true
});

const DriverAttendance = sq.define('driver_attendances', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  driver_code: {
    type: DataTypes.STRING,
    references: {
      model: Driver,
      key: 'driver_code'
    }
  },
  attendance_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  attendance_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
},{
  freezeTableName: true
});

const Shipment = sq.define('shipments', {
  shipment_no: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  shipment_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  shipment_status: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['RUNNING', 'DONE', 'CANCELLED']]
    }
  }
},{
  freezeTableName: true
});

const ShipmentCost = sq.define('shipment_costs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  driver_code: {
    type: DataTypes.STRING,
    references: {
      model: Driver,
      key: 'driver_code'
    }
  },
  shipment_no: {
    type: DataTypes.STRING,
    references: {
      model: Shipment,
      key: 'shipment_no'
    }
  },
  total_costs: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cost_status: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['PENDING', 'CONFIRMED', 'PAID']]
    }
  }
},{
  freezeTableName: true
});

const VariableConfig = sq.define('variable_configs', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
},{
  freezeTableName: true
});



sq.sync({alter: true,force: true}).then(async () => {
  const drivers = await csv().fromFile(`${process.cwd() }/seed/drivers.csv`);
  const shipments = await csv().fromFile(`${process.cwd() }/seed/shipments.csv`);
  const shipmentCosts = await csv().fromFile(`${process.cwd() }/seed/shipment_costs.csv`);
  const driverAttendances = await csv().fromFile(`${process.cwd() }/seed/driver_attendances.csv`);
  const variableConfigs = await csv().fromFile(`${process.cwd() }/seed/variable_configs.csv`);

  await Driver.bulkCreate(drivers);
  await Shipment.bulkCreate(shipments);
  await ShipmentCost.bulkCreate(shipmentCosts);
  await DriverAttendance.bulkCreate(driverAttendances);
  await VariableConfig.bulkCreate(variableConfigs);

  console.log('Database synchronized');
  process.exit(0);
})
.catch(err => {
  console.error('Error synchronizing database:', err);
});

export { Driver, DriverAttendance, Shipment, ShipmentCost, VariableConfig };
