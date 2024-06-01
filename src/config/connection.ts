import {Sequelize} from 'sequelize'
import 'dotenv/config'

const sq = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASS!, {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    dialect: 'postgres',
    logging:false,
    dialectOptions:{
      dateStrings: true,
      typeCast: true,
    },
    pool: {
      max: 100,
      min: 0,
      idle: 10000,
      acquire: 60000,
    },
    define :{
      timestamps: false
    }
  });
      
console.log('========== DB-CONNECTED =========')

  export default sq