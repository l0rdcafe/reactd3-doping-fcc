const getDopers = () => {
  return fetch(
    "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
  ).then((res) => res.json());
};

export default getDopers;
