import sq from "../../config/connection";
import{Response, Request} from "express";
import { QueryTypes } from "sequelize";

class Controller {
    static async list (req: Request, res: Response): Promise<Response> {
        const {page_size, current, month, year, driver_code, status, name} = req.query

        try {
            let isi = ''
            const limit = page_size ? parseInt(page_size as string) : 10;
            const page = current ? parseInt(current as string) : 1;
            const offset = (page - 1) * limit;            

            if (!month || !year) {
                if (!year && !month) {
                    return res.status(400).json({message: "Year and Month is required"})
                }else if (!month) {
                    return res.status(400).json({message: "Month is required"}) 
                }else{
                    return res.status(400).json({message: "Year is required"})
                }
            }

            if(month){
                isi += ` and x.bulan = :month`
            }
            if(year){
                isi += ` and x.tahun = :year`
            }
            if(driver_code){
                isi += ` and x.driver_code = :driver_code`
            }
            if(status){
                if(status == 'PENDING'){
                    isi += ` and x.total_pending > 0`
                }else if (status == 'CONFIRMED'){ 
                    isi += ` and x.total_confirmed > 0`
                }else if (status == 'PAID'){
                    isi += ` and x.total_paid > 0 and x.total_pending = 0 and x.total_confirmed = 0`
                }
            }
            if(name){
                isi += ` and x.name ilike :name`
            }
            
            let data = await sq.query(`select x.driver_code,x.name,x.total_pending,x.total_confirmed,x.total_paid,x.total_paid,x.count_shipment,x.total_attendance_salary,
            (x.total_pending + x.total_confirmed + x.total_paid + x.total_attendance_salary) as total_salary
            from (select d.driver_code,d."name",to_char(s.shipment_date,'YYYY') tahun,to_char(s.shipment_date,'FMMM') bulan,
            coalesce (sum(sc.total_costs) filter (where sc.cost_status = 'PENDING' and s.shipment_status<>'CANCELLED'),0) total_pending,
            coalesce (sum(sc.total_costs) filter (where sc.cost_status = 'CONFIRMED' and s.shipment_status<>'CANCELLED'),0) total_confirmed,
            coalesce (sum(sc.total_costs) filter (where sc.cost_status = 'PAID' and s.shipment_status<>'CANCELLED'),0) total_paid,
            count(sc.shipment_no) filter (where s.shipment_status <> 'CANCELLED') count_shipment, 
            coalesce(t.total_kehadiran,0)*(select vc.value from variable_configs vc) total_attendance_salary
            from shipment_costs sc 
            join drivers d on d.driver_code = sc.driver_code
            join shipments s on s.shipment_no = sc.shipment_no 
            left join (select da.driver_code,to_char(da.attendance_date,'YYYY') tahun,to_char(da.attendance_date,'FMMM') bulan,
            count(*) filter (where da.attendance_status = true)as total_kehadiran 
            from driver_attendances da
            group by da.driver_code,to_char(da.attendance_date,'YYYY'),to_char(da.attendance_date,'FMMM'))t on t.driver_code = sc.driver_code 
            and to_char(s.shipment_date,'YYYY') =t.tahun and to_char(s.shipment_date,'FMMM')=t.bulan
            group by d.driver_code,d."name",to_char(s.shipment_date,'YYYY'),to_char(s.shipment_date,'FMMM'),t.total_kehadiran
            order by d.driver_code) x
            where (x.total_pending + x.total_confirmed + x.total_paid + x.total_attendance_salary)>0${isi} offset :offset limit :limit`,{type: QueryTypes.SELECT,replacements:{ offset, limit, month, year, driver_code, status, name}})
            
            let jml = await sq.query(`select count(*) as total from (select d.driver_code,d."name",to_char(s.shipment_date,'YYYY') tahun,to_char(s.shipment_date,'FMMM') bulan,
            coalesce (sum(sc.total_costs) filter (where sc.cost_status = 'PENDING' and s.shipment_status<>'CANCELLED'),0) total_pending,
            coalesce (sum(sc.total_costs) filter (where sc.cost_status = 'CONFIRMED' and s.shipment_status<>'CANCELLED'),0) total_confirmed,
            coalesce (sum(sc.total_costs) filter (where sc.cost_status = 'PAID' and s.shipment_status<>'CANCELLED'),0) total_paid,
            count(sc.shipment_no) filter (where s.shipment_status <> 'CANCELLED') count_shipment, 
            coalesce(t.total_kehadiran,0)*(select vc.value from variable_configs vc) total_attendance_salary
            from shipment_costs sc 
            join drivers d on d.driver_code = sc.driver_code
            join shipments s on s.shipment_no = sc.shipment_no 
            left join (select da.driver_code,to_char(da.attendance_date,'YYYY') tahun,to_char(da.attendance_date,'FMMM') bulan,
            count(*) filter (where da.attendance_status = true)as total_kehadiran 
            from driver_attendances da
            group by da.driver_code,to_char(da.attendance_date,'YYYY'),to_char(da.attendance_date,'FMMM'))t on t.driver_code = sc.driver_code 
            and to_char(s.shipment_date,'YYYY') =t.tahun and to_char(s.shipment_date,'FMMM')=t.bulan
            group by d.driver_code,d."name",to_char(s.shipment_date,'YYYY'),to_char(s.shipment_date,'FMMM'),t.total_kehadiran
            order by d.driver_code) x
            where (x.total_pending + x.total_confirmed + x.total_paid + x.total_attendance_salary)>0${isi}`,{type: QueryTypes.SELECT,replacements:{ month, year, driver_code, status, name}})  

            return res.status(200).json({data,total_row:Number('total'in jml[0]?jml[0].total:0),current:page,page_size:limit})
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: '500', message: 'Internal Server Error' });
        }
    }
}
export default Controller