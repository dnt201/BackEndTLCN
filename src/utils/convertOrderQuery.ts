import { OrderQuery } from 'src/common/dto/Page';

export function ConvertOrderQuery(orderQuery: OrderQuery[]) {
  const data = {};
  orderQuery?.map((orderData: OrderQuery) => {
    data[orderData.name] = orderData.value;
  });
  return data;
}
