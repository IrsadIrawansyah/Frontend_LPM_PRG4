import Button from "./Button";

export default function Paging({ pageCurrent, totalData, navigation }) {
  const pageSize = 10;
  function generatePageButton(pageCurrent, totalData) {
    const totalPage = Math.ceil(totalData / pageSize);
    let pageButtons = [];

    if (totalPage === 0) return pageButtons;

    pageButtons.push(
      <Button
        key="previous"
        label="Sebelumnya"
        classType={pageCurrent > 1 ? "light border" : "light border disabled"}
        onClick={() => pageCurrent > 1 && navigation(pageCurrent - 1)}
      />
    );

    if (totalPage <= 2) {
      for (let i = 1; i <= totalPage; i++) {
        pageButtons.push(
          <Button
            key={`page-${i}`}
            label={i}
            classType={pageCurrent === i ? "primary" : "light border"}
            onClick={() => navigation(i)}
          />
        );
      }
    } else {
      if (pageCurrent === 1) {
        pageButtons.push(<Button key="page-1" label="1" classType="primary" />);
        pageButtons.push(
          <Button
            key="page-2"
            label="2"
            classType="light border"
            onClick={() => navigation(2)}
          />
        );
        pageButtons.push(
          <Button key="dots-1" label="..." classType="light border disabled" />
        );
      }

      // Untuk halaman saat ini 2
      else if (pageCurrent === 2) {
        pageButtons.push(
          <Button
            key="page-1"
            label="1"
            classType="light border"
            onClick={() => navigation(1)}
          />
        );
        pageButtons.push(<Button key="page-2" label="2" classType="primary" />);
        pageButtons.push(
          <Button key="dots-1" label="..." classType="light border disabled" />
        );
      } else {
        pageButtons.push(
          <Button key="dots-1" label="..." classType="light border disabled" />
        );
        pageButtons.push(
          <Button
            key={`page-${pageCurrent - 1}`}
            label={pageCurrent - 1}
            classType="light border"
            onClick={() => navigation(pageCurrent - 1)}
          />
        );
        pageButtons.push(
          <Button
            key={`page-${pageCurrent}`}
            label={pageCurrent}
            classType="primary"
          />
        );
        if (pageCurrent < totalPage - 1) {
          pageButtons.push(
            <Button
              key={`page-${pageCurrent + 1}`}
              label={pageCurrent + 1}
              classType="light border"
              onClick={() => navigation(pageCurrent + 1)}
            />
          );
          if (pageCurrent < totalPage - 2) {
            pageButtons.push(
              <Button
                key="dots-2"
                label="..."
                classType="light border disabled"
              />
            );
          }
        }
      }
    }
    pageButtons.push(
      <Button
        key="next"
        label="Selanjutnya"
        classType={
          pageCurrent < totalPage ? "light border" : "light border disabled"
        }
        onClick={() => pageCurrent < totalPage && navigation(pageCurrent + 1)}
      />
    );

    return pageButtons;
  }

  return (
    <div className="mt-lg-0 mt-md-0 mt-sm-3 mt-3">
      <div className="input-group">
        {generatePageButton(pageCurrent, totalData)}
      </div>
    </div>
  );
}
