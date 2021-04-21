import moment from 'moment';
import Dayjs from 'dayjs';
import Select, { LabeledValue } from 'antd/lib/select';
import React from 'react';

export const getCurrentDate = (date: string): string => {
  const d = new Date(date);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();

  return (day <= 9 ? 0 + day.toString() : day) + '/' + (month <= 9 ? 0 + month.toString() : month) + '/' + year;
};

export function formatDate(d: Date) {
  var month = '' + (d.getUTCMonth() + 1);
  var day = '' + d.getDate();
  var year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

export function addZero(x: any, n: any) {
  while (x.toString().length < n) {
    x = '0' + x;
  }
  return x;
}
/*
Este es que va a funcionar despues
export function parseFechaDetalle(fecha: string) {
  // substring extrae caracteres desde indiceA hasta indiceB sin incluirlo.

  var split = fecha.split('/', 3);
  
  const day = parseInt(split[0]);
  const month = parseInt(split[1]);
  const year = parseInt(split[2]);
  
  return year + '/' + month + '/' + day;
}
*/

export function parseFechaDetalle(fecha: string) {
  // substring extrae caracteres desde indiceA hasta indiceB sin incluirlo.

  var split = fecha.split('-', 3);

  //split:2020,10,21T16:23:58.727Z
  const day = parseInt(split[2]);
  const month = parseInt(split[1]);
  const year = parseInt(split[0]);

  /*
    day2020
    month10
    year21
  */

  return year + '/' + month + '/' + day;
}

export const palabraToLowerCase = (palabra: string) => {
  return palabra.charAt(0).toLowerCase() + palabra.slice(1);
};

export const palabraToUpperCase = (palabra: string) => {
  return palabra.charAt(0).toUpperCase() + palabra.slice(1);
};

export function getLegajoFromMail(email: string) {
  if (!email) return;
  const legajo = email.split('@')[0].toUpperCase();
  return legajo;
}

export function isDateBetween(minDate: Dayjs.Dayjs, maxDate: Dayjs.Dayjs, value: string, format?: string | string[]) {
  const date = Dayjs(value, format);

  const isAfter = date.isAfter(minDate);
  const isBefore = date.isBefore(maxDate);
  return isAfter && isBefore;
}

export function isDateBetweenMoment(minDate: moment.Moment, maxDate: moment.Moment, value: string, format?: string | string[]) {
  const date = moment(value, format);

  const isAfter = date.isAfter(minDate);
  const isBefore = date.isBefore(maxDate);
  return isAfter && isBefore;
}

const { Option } = Select;

export const renderOptions = (options?: LabeledValue[]) => {
  if (!options) return;

  return options.map((option, index) => (
    <Option key={option.value} value={option.value}>
      {option.label}
    </Option>
  ));
};
