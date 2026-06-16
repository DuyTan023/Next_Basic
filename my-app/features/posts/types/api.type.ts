
// định nghĩa 1 API có 3 thuộc tính: trạng thái(hoàn thành/thất bại), thông báo, dữ liệu
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
}