type Props = {
  id: string | number;
  onConfirm: () => void;
  onCancel: () => void;
};

function DuplicateIdMessage({ id, onConfirm, onCancel }: Props){
  return (
    <div>
      <span>
        ID «{id}» قبلاً وجود دارد. آیا اطلاعات وارد شده را ویرایش تلقی کنم؟
      </span>

      <button onClick={onConfirm}>ویرایش</button>
      <button onClick={onCancel}>انصراف</button>
    </div>
  );
}
export default DuplicateIdMessage;