export class NotificationDTO {
  body: string;
  type: string;
  timeOut?: number;
  userId: string;
  maxAttempt?: number;
  status: string;
  refType?: string;
  refId?: string;
  extendData?: string;
}
