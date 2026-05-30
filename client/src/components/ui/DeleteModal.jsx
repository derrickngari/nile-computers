const DeleteModal = ({ref, handleDelete, setIsDeleting, setSelectedItem, title, description}) => {
  return (
   <div className="modal modal-open backdrop-blur-xs">
          <div
            className="modal-box w-[95%] sm:w-full max-w-md rounded-lg"
            ref={ref}
          >
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="py-4 text-sm">
              {description}
            </p>

            <div className="modal-action">
              <button
                onClick={handleDelete}
                className="btn btn-error rounded-lg"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setIsDeleting(false);
                  setSelectedItem(null);
                }}
                className="btn rounded-lg border border-gray-400/40"
              >
                Cancel
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setIsDeleting(false)}
          />
        </div>
  )
}

export default DeleteModal