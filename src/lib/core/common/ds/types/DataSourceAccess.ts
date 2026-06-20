export type DataSourceAccess = {
  roleCode: string;
  query?: boolean;
  insert?: boolean;
  update?: boolean;
  delete?: boolean;
  audit?: boolean;
  export?: boolean;
};
