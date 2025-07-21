export interface User {
  userId?: number; // Cambia a opcional con '?'
  emailAddress: string;
  encryptedUserPassword: string;
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNumber: string;
  employeeId: number;
  rmaMenuId: number;
  enabledFlag: string;
  adminFlag: string;
  inactiveDate: string;
  contextValue: string;
  customField1: string;
  customField2: string;
  customField3: string;
  customField4: string;
  customField5: string;
  branchId: number;
  customerId: number;
  customerIds: string;
  isRegisteredUser: boolean;
}