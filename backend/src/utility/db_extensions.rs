pub trait Model<R>: TryFrom<R, Error = anyhow::Error> {}

pub trait IntoModels<R, M>
where
    M: Model<R>,
{
    fn into_models(self) -> Result<Vec<M>, anyhow::Error>
    where
        M: Model<R>;
}

impl<R, M, T> IntoModels<R, M> for T
where
    T: IntoIterator<Item = R>,
    M: Model<R>,
{
    fn into_models(self) -> Result<Vec<M>, anyhow::Error> {
        self.into_iter().map(|x| x.try_into()).collect()
    }
}
