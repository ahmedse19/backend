const fecha = require("fecha");
const connection = require("../DB/connectDB");
const util = require("util");
const {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
} = require("date-fns");
const e = require("express");

Number.prototype.toHHMM = function () {
  let sec_num = this / 1000;
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - hours * 3600) / 60);

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  return hours + ":" + minutes;
};

const query = util.promisify(connection.query).bind(connection);

const getIntervalQuery = (params, firstdate, seconddate) => {
  let start = null;
  let end = null;
  if (params === "day") {
    function isBusinessDay(date) {
      let day = date.getDay();
      if (day == 0 || day == 6) {
        return false;
      }
      return true;
    }
    let businessDay = new Date();
    while (!isBusinessDay(businessDay)) {
      date.setDate(date.getDate() - 1);
    }

    start = startOfDay(businessDay);
    end = endOfDay(businessDay);
  } else if (params === "week") {
    let date = new Date();
    date.setDate(date.getDate() + -6);
    start = startOfWeek(date, { weekStartsOn: 1 });
    end = endOfWeek(date, { weekStartsOn: 1 });
  } else if (params === "month") {
    let date = new Date();
    date.setMonth(date.getMonth() - 1);
    start = startOfMonth(date);
    end = endOfMonth(date);
  }
  if (
    params === "custom" &&
    firstdate !== undefined &&
    seconddate !== undefined
  ) {
    start = new Date(firstdate);
    end = new Date(seconddate);
    start = startOfDay(start);
    end = endOfDay(end);
  }

  start = fecha.format(start, "YYYY-MM-DD HH:mm:ss");
  end = fecha.format(end, "YYYY-MM-DD HH:mm:ss");
  const resultdate = ` date_de_deplacement BETWEEN \'${start} \' AND \'${end} \' `;

  return {
    result: resultdate,
    start: start.slice(0, 10),
    end: end.slice(0, 10),
  };
};

const getEmployees = async (id) => {
  try {
    if (id === undefined) {
      const rows = await query(`select *  from employee  `);

      return rows;
    } else {
      const rows = await query(
        `select *  from employee where id_employee = ${id} `
      );

      return rows;
    }
  } catch (error) {
    console.log(error);
  }
};

const getDayLogs = async (id, params, firstDate, endDate) => {
  try {
    const resultObject = getIntervalQuery(params, firstDate, endDate);

    const rows =
      await query(`select date_de_deplacement,TYPE,id_portail  from (pointage,employee,badges) WHERE pointage.id_badge=badges.id_badge AND 
  employee.id_employee = badges.id_employee AND employee.id_employee =${id} AND ${resultObject.result} `);
    if (rows.length === 0) return null;
    rows.sort(
      (a, b) =>
        new Date(a.date_de_deplacement) - new Date(b.date_de_deplacement)
    );

    return {
      data: rows,
      start: resultObject.start,
      end: resultObject.end,
    };
  } catch (e) {
    console.log("could not get daily logs");
    console.log(e);
  }
};

const getWorkHours = async (id, params, boolcheck, firstDate, endDate) => {
  const data = await getDayLogs(id, params, firstDate, endDate);
  if (data === null) return null;
  const rows = data.data;

  let neutral = 0;
  let working = 0;
  let capsule = null;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].id_portail === 999) continue; //check for time spent in break room, if so, skip
    if (rows[i].TYPE === "entree") {
      neutral++;
      capsule = rows[i].date_de_deplacement;
    } else if (rows[i].TYPE === "sortie") {
      neutral--;
      working += new Date(rows[i].date_de_deplacement) - new Date(capsule);
    }
    if (neutral < 0 && neutral > 1) {
      //check that every entry is paired with a exit
      break;
    }
  }
  if (neutral < 0 && neutral > 1) {
    throw new Error("not all entries are paired with exits");
  }

  if (boolcheck) return { ...data, workhours: working };
  else return { workhours: working, start: data.start, end: data.end };
};

const getdashboardData = async (req, res) => {
  const requestdata = req.query;

  const firstDate = requestdata.startDate;
  const endDate = requestdata.endDate;
  const params = requestdata.params;
  console.log(requestdata);
  const employees = await getEmployees();
  if (employees === null) {
    res.json({ error: "no employees found" });
    return;
  }
  for (const employe of employees) {
    const data = await getWorkHours(
      employe.id_employee,
      params,
      false,
      firstDate,
      endDate
    );
    if (data === null) continue;
    employe.workhours = data.workhours;
    employe.start = data.start;
    employe.end = data.end;
  }

  res.json(employees);
};

const getEmployeedata = async (req, res) => {
  const requestdata = req.query;
  const id = requestdata.id;
  const firstDate = new Date(requestdata.firstDate);
  const endDate = new Date(requestdata.endDate);
  const params = requestdata.params;

  const myemployee = await getEmployees(id);

  const resultdata = await getWorkHours(id, params, true, firstDate, endDate);
  if (resultdata === null) {
    res.json(null);
    return;
  }
  res.json({ ...myemployee, ...resultdata });
};

module.exports = { getdashboardData, getEmployeedata };
