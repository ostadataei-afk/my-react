type Row = {
  [key: string]: string | number | null;
};


type Props = {
  row: Row | null;
};


function RowDetails({ row }: Props) {


  if (!row) {
    return <p>یک رکورد انتخاب کنید</p>;
  }


  return (
    <div>

      <h3>جزئیات رکورد</h3>

      {
        Object.keys(row).map((key) => (

          <p key={key}>
            <b>{key}: </b>
            {row[key] ?? "-"}
          </p>

        ))
      }

    </div>
  );
}


export default RowDetails;